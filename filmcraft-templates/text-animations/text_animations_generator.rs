//! Builds the "Text Animations" titles as FilmCraft .fcgt files (one per animation) and renders
//! preview frames. Usage: sk_text <out dir> <Poppins-SemiBold.ttf>
use filmcraft_geom::{Affine, Vec2};
use filmcraft_project::EffectInstance;
use filmcraft_project::graphic::new_text_layer;
use filmcraft_project::graphic_design::{GraphicMeta, LayerExtra};
use filmcraft_project::gtemplate::{ControlKind, FontResource, GraphicsTemplate, Resources, TemplateControl, base64_encode};
use filmcraft_project::keyframe::{Interpolation, Keyframe, Param, ParamValue};
use filmcraft_time::{TICKS_PER_SECOND, Tick};

const SECS: f64 = 5.0;
/// Length of the in / out animations ("Fast" in the original).
const IN: f64 = 0.7;
const OUT: f64 = 0.6;

fn tk(s: f64) -> Tick {
    Tick((s * TICKS_PER_SECOND as f64).round() as i64)
}
fn set(e: &mut EffectInstance, id: &str, v: ParamValue) {
    e.params.insert(id.into(), Param::new(v));
}
fn key(s: f64, v: ParamValue, interp: Interpolation, out_inf: f64, in_inf: f64) -> Keyframe {
    let mut k = Keyframe::new(tk(s), v);
    k.interp = interp;
    k.out_influence = out_inf;
    k.in_influence = in_inf;
    k
}
/// `from` → `rest` over the intro (decelerating), held, then `rest` → `to` over the outro
/// (accelerating).
fn in_out(e: &mut EffectInstance, id: &str, from: ParamValue, rest: ParamValue, to: ParamValue) {
    use Interpolation::*;
    let kfs = vec![
        key(0.0, from.clone(), Linear, 1.0 / 3.0, 1.0 / 3.0),
        key(IN, rest.clone(), EaseIn, 1.0 / 3.0, 0.9),
        key(SECS - OUT, rest, EaseOut, 0.9, 1.0 / 3.0),
        key(SECS, to, Linear, 1.0 / 3.0, 1.0 / 3.0),
    ];
    e.params.insert(id.into(), Param { value: from, keyframes: kfs });
}
fn f(v: f64) -> ParamValue {
    ParamValue::Float(v)
}
fn v2(x: f64, y: f64) -> ParamValue {
    ParamValue::Vec2(Vec2::new(x, y))
}

fn title() -> EffectInstance {
    let mut e = new_text_layer("Sk Text Animations", Vec2::new(960.0, 558.0), 50.0);
    set(&mut e, "name", ParamValue::Text("Text".into()));
    set(&mut e, "font", ParamValue::Text("Poppins".into()));
    set(&mut e, "font_style", ParamValue::Text("SemiBold".into()));
    set(&mut e, "align", ParamValue::Choice(1));
    set(&mut e, "fill_color", ParamValue::Color([1.0, 1.0, 1.0, 1.0]));
    e.layer = Some(Box::new(LayerExtra { uid: 1, ..Default::default() }));
    e
}

fn main() {
    let mut args = std::env::args().skip(1);
    let out = args.next().expect("output dir");
    let font = std::fs::read(args.next().expect("font file")).expect("font");
    filmcraft_text::fonts::add_font_data(font.clone());
    let fonts = Resources {
        fonts: vec![FontResource {
            family: "Poppins".into(),
            style: "SemiBold".into(),
            license: "OFL-1.1".into(),
            file: "Poppins-SemiBold.ttf".into(),
            data: base64_encode(&font),
        }],
    };

    type Anim = fn(&mut EffectInstance);
    let anims: [(&str, &str, &str, Anim); 6] = [
        ("0", "No Animation", "Titre fixe, sans animation.", |_| {}),
        ("1", "Slide Up", "Le texte monte en apparaissant, puis continue de monter en disparaissant.", |e| {
            in_out(e, "anchor", v2(0.0, -70.0), v2(0.0, 0.0), v2(0.0, 70.0));
            in_out(e, "opacity", f(0.0), f(100.0), f(0.0));
        }),
        ("2", "Smooth Zoom", "Le texte grossit doucement en apparaissant et en disparaissant.", |e| {
            in_out(e, "scale", f(70.0), f(100.0), f(120.0));
            in_out(e, "opacity", f(0.0), f(100.0), f(0.0));
        }),
        ("3", "Smooth Tracking", "Les lettres se resserrent en apparaissant et s'écartent en disparaissant.", |e| {
            in_out(e, "tracking", f(600.0), f(0.0), f(600.0));
            in_out(e, "opacity", f(0.0), f(100.0), f(0.0));
        }),
        ("4", "Smooth Blur", "Le texte sort d'un flou lumineux et y retourne.", |e| {
            set(e, "shadow", ParamValue::Bool(true));
            set(e, "shadow_color", ParamValue::Color([1.0, 1.0, 1.0, 1.0]));
            set(e, "shadow_distance", f(0.0));
            in_out(e, "shadow_blur", f(70.0), f(0.0), f(70.0));
            in_out(e, "shadow_size", f(10.0), f(0.0), f(10.0));
            in_out(e, "shadow_opacity", f(90.0), f(0.0), f(90.0));
            in_out(e, "scale", f(108.0), f(100.0), f(108.0));
            in_out(e, "opacity", f(0.0), f(100.0), f(0.0));
        }),
        ("5", "Smooth Fade", "Fondu doux en entrée et en sortie.", |e| {
            in_out(e, "opacity", f(0.0), f(100.0), f(0.0));
        }),
    ];

    for (num, name, desc, anim) in anims {
        let mut layer = title();
        anim(&mut layer);
        let blur = num == "4";
        let mut controls = vec![
            TemplateControl { id: "text".into(), name: "Source Text".into(), kind: ControlKind::Text, layer: 1, param: "text".into(), min: None, max: None },
            TemplateControl { id: "font".into(), name: "Font".into(), kind: ControlKind::Font, layer: 1, param: "font".into(), min: None, max: None },
            TemplateControl { id: "position".into(), name: "Text Position".into(), kind: ControlKind::Position, layer: 1, param: "position".into(), min: None, max: None },
            TemplateControl { id: "size".into(), name: "Text Size".into(), kind: ControlKind::Slider, layer: 1, param: "size".into(), min: Some(1.0), max: Some(250.0) },
            TemplateControl { id: "color".into(), name: "Text Color".into(), kind: ControlKind::Color, layer: 1, param: "fill_color".into(), min: None, max: None },
        ];
        if blur {
            controls.push(TemplateControl { id: "blur_color".into(), name: "Blur Color".into(), kind: ControlKind::Color, layer: 1, param: "shadow_color".into(), min: None, max: None });
        }
        let animated = num != "0";
        let t = GraphicsTemplate {
            id: format!("user:text-animations-{}", filmcraft_project::gtemplate::slug(name)),
            name: format!("Text Animations – {num}. {name}"),
            category: "Titles".into(),
            description: format!("{desc} Recréé pour FilmCraft d'après « Sk Tadas Text Animations (Demo) »."),
            author: "Sk Tadas (design original) — recréation FilmCraft".into(),
            license: "Usage personnel, voir la licence Sk Tadas. Police Poppins : OFL-1.1".into(),
            tags: ["title", "text", "animation", "smooth", "poppins"].map(String::from).to_vec(),
            canvas: [1920, 1080],
            duration: tk(SECS),
            layers: vec![layer],
            graphic: if animated {
                GraphicMeta { intro: tk(IN), outro: tk(OUT), design_in: Tick::ZERO, design_duration: tk(SECS), ..Default::default() }
            } else {
                GraphicMeta::default()
            },
            controls,
            resources: fonts.clone(),
            ..Default::default()
        };
        let json = t.to_json();
        GraphicsTemplate::from_bytes(json.as_bytes()).expect("valid template");
        std::fs::write(format!("{out}/Text Animations - {num}. {name}.fcgt"), &json).unwrap();
        for s in [0.15, 0.35, 2.5, 4.7] {
            let (w, h) = (960usize, 540usize);
            let mut img = filmcraft_render::image::Image::filled(w, h, [0.0, 0.0, 0.0, 1.0]);
            filmcraft_render::graphic_clip::render_graphic_layers(&t.layers, tk(s), (1920, 1080), &Affine::scale(0.5, 0.5), &mut img);
            let p = format!("{out}/prev_{num}_{:03}.png", (s * 100.0) as u32);
            image::save_buffer(&p, &img.to_rgba8(), w as u32, h as u32, image::ColorType::Rgba8).unwrap();
        }
    }
}
