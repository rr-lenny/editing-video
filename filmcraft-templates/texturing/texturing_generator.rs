//! Builds "Texturing" (vertical 1080×1920 paper-texture background) as a FilmCraft .fcgt and
//! renders preview frames. The textures are drawn as vector path layers: each layer packs many
//! small shapes into one polygon, joined by zero-width bridges.
//! Usage: sk_texture <out dir> [preview suffix] [layer=on,...]
use filmcraft_geom::{Affine, Vec2};
use filmcraft_project::EffectInstance;
use filmcraft_project::graphic::new_shape_layer;
use filmcraft_project::graphic_design::LayerExtra;
use filmcraft_project::gtemplate::{ControlKind, GraphicsTemplate, TemplateControl};
use filmcraft_project::keyframe::{Param, ParamValue};
use filmcraft_time::{TICKS_PER_SECOND, Tick};

const W: f64 = 1080.0;
const H: f64 = 1920.0;

/// Small deterministic PRNG (xorshift).
struct Rng(u64);
impl Rng {
    fn next(&mut self) -> f64 {
        self.0 ^= self.0 << 13;
        self.0 ^= self.0 >> 7;
        self.0 ^= self.0 << 17;
        (self.0 >> 11) as f64 / (1u64 << 53) as f64
    }
    fn range(&mut self, a: f64, b: f64) -> f64 {
        a + (b - a) * self.next()
    }
}

/// Many closed shapes in one polygon: from a hub, each shape is reached and left along the same
/// segment, so the bridges enclose no area.
struct Packed {
    pts: Vec<[f32; 2]>,
    hub: [f32; 2],
}
impl Packed {
    fn new() -> Self {
        let hub = [(-W / 2.0 - 40.0) as f32, (-H / 2.0 - 40.0) as f32];
        Packed { pts: vec![hub], hub }
    }
    /// Add a closed shape (points in canvas pixels, clockwise on screen).
    fn add(&mut self, shape: &[(f64, f64)]) {
        let p: Vec<[f32; 2]> = shape.iter().map(|(x, y)| [(x - W / 2.0) as f32, (y - H / 2.0) as f32]).collect();
        self.pts.extend_from_slice(&p);
        self.pts.push(p[0]);
        self.pts.push(self.hub);
    }
}

fn set(e: &mut EffectInstance, id: &str, v: ParamValue) {
    e.params.insert(id.into(), Param::new(v));
}
fn layer(uid: u64, name: &str, kind: u32, size: (f64, f64), pts: Vec<[f32; 2]>, color: [f32; 4], opacity: f64) -> EffectInstance {
    let mut e = new_shape_layer(kind, Vec2::new(W / 2.0, H / 2.0), Vec2::new(size.0, size.1), pts);
    set(&mut e, "name", ParamValue::Text(name.into()));
    set(&mut e, "fill_color", ParamValue::Color(color));
    set(&mut e, "opacity", ParamValue::Float(opacity));
    e.layer = Some(Box::new(LayerExtra { uid, ..Default::default() }));
    e
}
fn rot(x: f64, y: f64, cx: f64, cy: f64, a: f64) -> (f64, f64) {
    let (s, c) = a.sin_cos();
    let (dx, dy) = (x - cx, y - cy);
    (cx + dx * c - dy * s, cy + dx * s + dy * c)
}
fn quad(x: f64, y: f64, w: f64, h: f64, a: f64) -> Vec<(f64, f64)> {
    let (cx, cy) = (x + w / 2.0, y + h / 2.0);
    [(x, y), (x + w, y), (x + w, y + h), (x, y + h)].iter().map(|&(px, py)| rot(px, py, cx, cy, a)).collect()
}
fn blob(r: &mut Rng, cx: f64, cy: f64, rx: f64, ry: f64, n: usize) -> Vec<(f64, f64)> {
    let ph = r.range(0.0, 6.28);
    (0..n)
        .map(|i| {
            let a = std::f64::consts::TAU * i as f64 / n as f64;
            let k = 1.0 + 0.18 * (3.0 * a + ph).sin() + 0.1 * (5.0 * a + 2.0 * ph).cos();
            (cx + a.cos() * rx * k, cy + a.sin() * ry * k)
        })
        .collect()
}

/// Runs `[x, y, w, h]` (canvas pixels) packed as one polygon: per row a comb along the row's
/// baseline (the baseline is walked out and back, so it encloses no area), rows joined to the hub.
fn runs_path(runs: &[[f64; 4]]) -> Vec<[f32; 2]> {
    let mut p = Packed::new();
    let mut i = 0;
    while i < runs.len() {
        let (y, h) = (runs[i][1], runs[i][3]);
        let mut j = i;
        while j < runs.len() && runs[j][1] == y {
            j += 1;
        }
        let yb = y + h;
        let mut row: Vec<(f64, f64)> = Vec::with_capacity((j - i) * 4 + 1);
        for r in &runs[i..j] {
            let (x0, x1) = (r[0], r[0] + r[2]);
            row.extend_from_slice(&[(x0, yb), (x0, y), (x1, y), (x1, yb)]);
        }
        p.add(&row);
        i = j;
    }
    p.pts
}

fn main() {
    let mut args = std::env::args().skip(1);
    let out = args.next().expect("output dir");
    let tex: serde_json::Value = serde_json::from_slice(&std::fs::read(args.next().expect("texture.json")).unwrap()).unwrap();
    let get = |k: &str| -> Vec<[f64; 4]> { serde_json::from_value(tex[k].clone()).unwrap() };
    let base: Vec<f32> = serde_json::from_value(tex["base"].clone()).unwrap();
    let mut r = Rng(0x9e37_79b9_7f4a_7c15);
    let ink = [0.145, 0.137, 0.135, 1.0];
    let full = (W, H);
    let soft = |e: &mut EffectInstance, c: [f32; 4], blur: f64| {
        set(e, "shadow", ParamValue::Bool(true));
        set(e, "shadow_color", ParamValue::Color(c));
        set(e, "shadow_opacity", ParamValue::Float(100.0));
        set(e, "shadow_distance", ParamValue::Float(0.0));
        set(e, "shadow_blur", ParamValue::Float(blur));
    };

    // 1. card stock colour
    let paper = layer(1, "Paper", 0, full, vec![], [base[0], base[1], base[2], 1.0], 100.0);
    // 2–3. colour variation of the card (blurred light / dark patches from the original)
    let mut var_l = layer(2, "Color Variation Light", 3, full, runs_path(&get("blotch_light")), [1.0, 1.0, 1.0, 0.0], 4.0);
    soft(&mut var_l, [1.0, 0.85, 0.9, 1.0], 170.0);
    let mut var_d = layer(3, "Color Variation Dark", 3, full, runs_path(&get("blotch_dark")), [0.0, 0.0, 0.0, 0.0], 18.0);
    soft(&mut var_d, [0.0, 0.0, 0.0, 1.0], 170.0);
    // 4–5. card stock grain, traced from the original texture
    let hi = layer(4, "Card Grain Highlights", 3, full, runs_path(&get("light")), [1.0, 1.0, 1.0, 1.0], 3.5);
    let lo = layer(5, "Card Grain Shadows", 3, full, runs_path(&get("dark")), [0.0, 0.0, 0.0, 1.0], 22.0);

    // 6. faded newspaper (off by default): columns of "words", slightly rotated
    let mut p = Packed::new();
    let ang = -0.05;
    let (cols, gutter, margin) = (3usize, 34.0, -120.0);
    let colw = (W - 2.0 * margin - gutter * (cols as f64 - 1.0)) / cols as f64;
    let word = |p: &mut Packed, x: f64, y: f64, w: f64, h: f64| {
        p.add(&quad(x, y, w, h, 0.0).iter().map(|&q| rot(q.0, q.1, W / 2.0, H / 2.0, ang)).collect::<Vec<_>>());
    };
    for c in 0..cols {
        let x0 = margin + c as f64 * (colw + gutter);
        let mut y = -140.0 + r.range(0.0, 60.0);
        while y < H + 140.0 {
            if r.next() < 0.06 {
                for _ in 0..2 {
                    let mut x = x0;
                    while x < x0 + colw - 30.0 {
                        let w = r.range(40.0, 120.0).min(x0 + colw - x);
                        word(&mut p, x, y, w, 22.0);
                        x += w + 16.0;
                    }
                    y += 34.0;
                }
                y += 20.0;
                continue;
            }
            let mut x = x0 + if r.next() < 0.12 { 24.0 } else { 0.0 };
            let end = if r.next() < 0.15 { x0 + colw * r.range(0.3, 0.8) } else { x0 + colw };
            while x < end - 8.0 {
                let w = r.range(14.0, 70.0).min(end - x);
                word(&mut p, x, y, w, 8.0);
                x += w + r.range(7.0, 11.0);
            }
            y += 19.0;
            if r.next() < 0.05 {
                y += 26.0;
            }
        }
    }
    let mut news = layer(6, "Newspaper", 3, full, p.pts, ink, 12.0);
    news.enabled = false;

    // 7. ridges (off by default): thin wavy horizontal strips
    let mut p = Packed::new();
    let mut y = 4.0;
    while y < H {
        let th = r.range(1.2, 3.2);
        let (f1, f2, ph) = (r.range(0.002, 0.006), r.range(0.01, 0.02), r.range(0.0, 6.28));
        let amp = r.range(1.0, 5.0);
        let n = 36;
        let wave = |x: f64| y + amp * (x * f1 + ph).sin() + 0.6 * (x * f2 + 2.0 * ph).sin();
        let mut s: Vec<(f64, f64)> = (0..=n).map(|i| -20.0 + (W + 40.0) * i as f64 / n as f64).map(|x| (x, wave(x))).collect();
        s.extend((0..=n).rev().map(|i| -20.0 + (W + 40.0) * i as f64 / n as f64).map(|x| (x, wave(x) + th)));
        p.add(&s);
        y += r.range(9.0, 22.0);
    }
    let mut ridges = layer(7, "Ridges", 3, full, p.pts, [0.0, 0.0, 0.0, 1.0], 12.0);
    ridges.enabled = false;

    // 8. dust (off by default): specks and short fibres
    let mut p = Packed::new();
    for _ in 0..1800 {
        let (x, y) = (r.range(0.0, W), r.range(0.0, H));
        let s = r.range(0.8, 2.4);
        p.add(&quad(x, y, s, s * r.range(0.6, 1.4), r.range(0.0, 3.14)));
    }
    for _ in 0..180 {
        let (x, y) = (r.range(0.0, W), r.range(0.0, H));
        p.add(&quad(x, y, r.range(8.0, 24.0), r.range(0.7, 1.3), r.range(0.0, 3.14)));
    }
    let mut dust = layer(8, "Dust", 3, full, p.pts, ink, 45.0);
    dust.enabled = false;

    // 9. vignette: outer stroke whose blurred shadow falls inwards
    let mut vig = layer(9, "Vignette", 0, full, vec![], [0.0; 4], 100.0);
    set(&mut vig, "fill", ParamValue::Bool(false));
    set(&mut vig, "stroke", ParamValue::Bool(true));
    set(&mut vig, "stroke_color", ParamValue::Color([0.0, 0.0, 0.0, 1.0]));
    set(&mut vig, "stroke_width", ParamValue::Float(300.0));
    set(&mut vig, "stroke_type", ParamValue::Choice(0));
    soft(&mut vig, [0.0, 0.0, 0.0, 1.0], 260.0);
    set(&mut vig, "shadow_size", ParamValue::Float(60.0));
    set(&mut vig, "shadow_opacity", ParamValue::Float(35.0));

    let mut layers = vec![paper, var_l, var_d, hi, lo, news, ridges, dust, vig];
    // preview: "all" turns every optional layer on
    let all = args.next().as_deref() == Some("all");
    if all {
        for l in &mut layers {
            l.enabled = true;
        }
    }

    let c = |id: &str, name: &str, kind: ControlKind, layer: u64, param: &str, r: Option<(f64, f64)>| TemplateControl {
        id: id.into(),
        name: name.into(),
        kind,
        layer,
        param: param.into(),
        min: r.map(|r| r.0),
        max: r.map(|r| r.1),
    };
    use ControlKind::*;
    let pc = Some((0.0, 100.0));
    let t = GraphicsTemplate {
        id: "user:texturing-vertical".into(),
        name: "Texturing (Vertical)".into(),
        category: "Backgrounds".into(),
        description: "Fond papier cartonné texturé, vertical 9:16, sans texte. Couleur du papier au choix ; grain, variations de couleur, journal délavé, rainures, poussières et vignettage activables et dosables. Recréé pour FilmCraft d'après le projet After Effects « Texturing » et son Texture.psd.".into(),
        author: "Recréation FilmCraft".into(),
        license: "Usage personnel".into(),
        tags: ["background", "texture", "paper", "card stock", "grain", "newspaper", "vertical"].map(String::from).to_vec(),
        canvas: [1080, 1920],
        duration: Tick(10 * TICKS_PER_SECOND),
        layers,
        controls: vec![
            c("paper_color", "Paper Color", Color, 1, "fill_color", None),
            c("grain", "Card Grain", Checkbox, 4, "enabled", None),
            c("grain_light", "Grain Highlights Amount", Slider, 4, "opacity", pc),
            c("grain_shadows", "Card Grain Shadows", Checkbox, 5, "enabled", None),
            c("grain_dark", "Grain Shadows Amount", Slider, 5, "opacity", pc),
            c("variation", "Color Variation", Checkbox, 2, "enabled", None),
            c("variation_light", "Color Variation Light Amount", Slider, 2, "opacity", pc),
            c("variation_tint", "Color Variation Tint", Color, 2, "shadow_color", None),
            c("variation_dark_on", "Color Variation Dark", Checkbox, 3, "enabled", None),
            c("variation_dark", "Color Variation Dark Amount", Slider, 3, "opacity", pc),
            c("newspaper", "Newspaper", Checkbox, 6, "enabled", None),
            c("newspaper_color", "Newspaper Color", Color, 6, "fill_color", None),
            c("newspaper_amount", "Newspaper Amount", Slider, 6, "opacity", pc),
            c("ridges", "Ridges", Checkbox, 7, "enabled", None),
            c("ridges_amount", "Ridges Amount", Slider, 7, "opacity", pc),
            c("dust", "Dust", Checkbox, 8, "enabled", None),
            c("dust_color", "Dust Color", Color, 8, "fill_color", None),
            c("dust_amount", "Dust Amount", Slider, 8, "opacity", pc),
            c("vignette", "Vignette", Checkbox, 9, "enabled", None),
            c("vignette_color", "Vignette Color", Color, 9, "shadow_color", None),
            c("vignette_amount", "Vignette Amount", Slider, 9, "shadow_opacity", pc),
        ],
        ..Default::default()
    };
    // compact JSON: the traced grain has a few hundred thousand points
    let json = serde_json::to_string(&t).unwrap();
    GraphicsTemplate::from_bytes(json.as_bytes()).expect("valid template");
    let tag = if all { "_all" } else { "" };
    if !all {
        std::fs::write(format!("{out}/Texturing (Vertical).fcgt"), &json).unwrap();
        println!("fcgt: {} bytes", json.len());
    }
    for (i, l) in t.layers.iter().enumerate() {
        let mut one = l.clone();
        one.enabled = true;
        let t0 = std::time::Instant::now();
        let mut img = filmcraft_render::image::Image::new(1080, 1920);
        filmcraft_render::graphic_clip::render_graphic_layers(&[one], Tick::ZERO, (1080, 1920), &Affine::scale(1.0, 1.0), &mut img);
        println!("layer {i}: {:?}", t0.elapsed());
    }
    let t0 = std::time::Instant::now();
    let mut img = filmcraft_render::image::Image::new(1080, 1920);
    filmcraft_render::graphic_clip::render_graphic_layers(&t.layers, Tick::ZERO, (1080, 1920), &Affine::scale(1.0, 1.0), &mut img);
    println!("render {:?}", t0.elapsed());
    image::save_buffer(format!("{out}/tex{tag}_full.png"), &img.to_rgba8(), 1080, 1920, image::ColorType::Rgba8).unwrap();
}
