//! Builds "Simple Animated Background" as a FilmCraft .fcgt and renders preview frames.
use filmcraft_geom::{Affine, Vec2};
use filmcraft_project::EffectInstance;
use filmcraft_project::graphic::new_shape_layer;
use filmcraft_project::graphic_design::LayerExtra;
use filmcraft_project::gtemplate::{ControlKind, GraphicsTemplate, TemplateControl};
use filmcraft_project::keyframe::{Interpolation, Keyframe, Param, ParamValue};
use filmcraft_time::{TICKS_PER_SECOND, Tick};

const W: f64 = 1920.0;
const H: f64 = 1080.0;
const SECS: i64 = 30;

fn set(e: &mut EffectInstance, id: &str, v: ParamValue) {
    e.params.insert(id.into(), Param::new(v));
}
fn anim(e: &mut EffectInstance, id: &str, keys: &[(f64, ParamValue)]) {
    let kfs = keys
        .iter()
        .map(|(s, v)| {
            let mut k = Keyframe::new(Tick((s * TICKS_PER_SECOND as f64) as i64), v.clone());
            k.interp = Interpolation::ContinuousBezier;
            k
        })
        .collect();
    e.params.insert(id.into(), Param { value: keys[0].1.clone(), keyframes: kfs });
}
fn rect(uid: u64, name: &str, size: (f64, f64)) -> EffectInstance {
    let mut e = new_shape_layer(0, Vec2::new(W / 2.0, H / 2.0), Vec2::new(size.0, size.1), vec![]);
    set(&mut e, "name", ParamValue::Text(name.into()));
    e.layer = Some(Box::new(LayerExtra { uid, ..Default::default() }));
    e
}
fn gradient(e: &mut EffectInstance, a: [f32; 4], b: [f32; 4]) {
    set(e, "fill_kind", ParamValue::Choice(1));
    set(e, "gradient_start", ParamValue::Color(a));
    set(e, "gradient_end", ParamValue::Color(b));
}
/// Slow drift of position and gradient angle (stands in for wiggle(0.5, 800)); loops seamlessly.
fn drift(e: &mut EffectInstance, pts: &[(f64, f64)], angles: &[f64]) {
    let n = pts.len();
    let step = SECS as f64 / n as f64;
    let mut pk: Vec<_> = pts.iter().enumerate().map(|(i, p)| (i as f64 * step, ParamValue::Vec2(Vec2::new(W / 2.0 + p.0, H / 2.0 + p.1)))).collect();
    pk.push((SECS as f64, pk[0].1.clone()));
    anim(e, "position", &pk);
    let mut ak: Vec<_> = angles.iter().enumerate().map(|(i, a)| (i as f64 * step, ParamValue::Float(*a))).collect();
    ak.push((SECS as f64, ak[0].1.clone()));
    anim(e, "gradient_angle", &ak);
}
fn ctl(id: &str, name: &str, kind: ControlKind, layer: u64, param: &str, r: Option<(f64, f64)>) -> TemplateControl {
    TemplateControl { id: id.into(), name: name.into(), kind, layer, param: param.into(), min: r.map(|r| r.0), max: r.map(|r| r.1) }
}

fn main() {
    let out = std::env::args().nth(1).expect("output dir");
    let c1 = [0.635_294_1, 0.0, 1.0, 1.0];
    let c2 = [0.277_647_9, 0.0, 1.0, 1.0];
    let black = [0.0, 0.0, 0.0, 1.0];
    let clear = [0.0, 0.0, 0.0, 0.0];

    let mut backdrop = rect(1, "Backdrop", (W, H));
    set(&mut backdrop, "fill_color", ParamValue::Color(black));

    let big = (W * 1.35, H * 1.5);
    let shade = (W * 1.3, H * 1.25);
    let mut glow = rect(2, "Gradient", big);
    gradient(&mut glow, c1, c2);
    set(&mut glow, "opacity", ParamValue::Float(50.3));
    drift(&mut glow, &[(0.0, 0.0), (-220.0, 100.0), (160.0, -140.0), (200.0, 120.0), (-130.0, -90.0)], &[0.0, 18.0, -12.0, 25.0, -8.0]);

    let mut shade3 = rect(3, "Shade 3", shade);
    gradient(&mut shade3, black, clear);
    drift(&mut shade3, &[(0.0, 0.0), (160.0, 90.0), (-150.0, 60.0), (-100.0, -110.0), (170.0, -50.0)], &[265.0, 290.0, 250.0, 280.0, 255.0]);

    let mut shade4 = rect(4, "Shade 4", shade);
    gradient(&mut shade4, black, clear);
    set(&mut shade4, "opacity", ParamValue::Float(70.0));
    drift(&mut shade4, &[(0.0, 0.0), (-140.0, -90.0), (180.0, -40.0), (80.0, 110.0), (-170.0, 70.0)], &[215.0, 240.0, 200.0, 230.0, 205.0]);

    // Vignette: an outer stroke just outside the frame whose blurred shadow falls inwards.
    let mut vig = rect(5, "Vignette", (W, H));
    set(&mut vig, "fill", ParamValue::Bool(false));
    set(&mut vig, "stroke", ParamValue::Bool(true));
    set(&mut vig, "stroke_color", ParamValue::Color(black));
    set(&mut vig, "stroke_width", ParamValue::Float(300.0));
    set(&mut vig, "stroke_type", ParamValue::Choice(0));
    set(&mut vig, "shadow", ParamValue::Bool(true));
    set(&mut vig, "shadow_color", ParamValue::Color(black));
    set(&mut vig, "shadow_distance", ParamValue::Float(0.0));
    set(&mut vig, "shadow_size", ParamValue::Float(60.0));
    set(&mut vig, "shadow_blur", ParamValue::Float(700.0));
    set(&mut vig, "shadow_opacity", ParamValue::Float(85.0));
    let vig_on = std::env::var("VIG").is_ok();
    if !vig_on {
        vig.enabled = false;
    }

    let k = ControlKind::Color;
    let t = GraphicsTemplate {
        id: "user:sk-tadas-simple-animated-background".into(),
        name: "Simple Animated Background".into(),
        category: "Backgrounds".into(),
        description: "Fond dégradé animé (couleurs qui dérivent lentement, en boucle sur 30 s) avec vignettage optionnel. Recréé pour FilmCraft d'après « Sk Tadas Simple Animated Background ».".into(),
        author: "Sk Tadas (design original) — recréation FilmCraft".into(),
        license: "Usage personnel, voir la licence Sk Tadas".into(),
        tags: ["background", "gradient", "minimalist", "simple", "animated"].map(String::from).to_vec(),
        canvas: [1920, 1080],
        duration: Tick(SECS * TICKS_PER_SECOND),
        layers: vec![backdrop, glow, shade3, shade4, vig],
        controls: vec![
            ctl("opacity", "Opacity", ControlKind::Slider, 2, "opacity", Some((0.0, 100.0))),
            ctl("color_1", "Color 1", k, 2, "gradient_start", None),
            ctl("color_2", "Color 2", k, 2, "gradient_end", None),
            ctl("color_3", "Color 3", k, 3, "gradient_start", None),
            ctl("color_4", "Color 4", k, 4, "gradient_start", None),
            ctl("backdrop", "Backdrop Color", k, 1, "fill_color", None),
            ctl("vignette", "Vignette", ControlKind::Checkbox, 5, "enabled", None),
            ctl("vignette_amount", "Vignette Amount", ControlKind::Slider, 5, "shadow_opacity", Some((0.0, 100.0))),
        ],
        ..Default::default()
    };
    let json = t.to_json();
    GraphicsTemplate::from_bytes(json.as_bytes()).expect("valid template");
    if !vig_on {
        std::fs::write(format!("{out}/Simple Animated Background.fcgt"), &json).unwrap();
    }
    for s in [0.0, 6.0, 12.0, 18.0, 24.0] {
        let (w, h) = (960usize, 540usize);
        let mut img = filmcraft_render::image::Image::new(w, h);
        let at = Tick((s * TICKS_PER_SECOND as f64) as i64);
        filmcraft_render::graphic_clip::render_graphic_layers(&t.layers, at, (1920, 1080), &Affine::scale(0.5, 0.5), &mut img);
        let name = format!("{out}/preview_{}{:02}.png", if vig_on { "vig_" } else { "" }, s as u32);
        image::save_buffer(&name, &img.to_rgba8(), w as u32, h as u32, image::ColorType::Rgba8).unwrap();
    }
}
