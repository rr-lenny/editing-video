//! Builds the "Text Animations" effect presets (in / out pairs that work on any clip) as a
//! FilmCraft effect-presets file, then imports and applies them to a title in the demo project
//! and exports program frames. Usage: sk_presets <out dir>
use filmcraft_engine::Session;
use filmcraft_engine::presets::{EffectPreset, KeyframeMode};
use filmcraft_geom::Vec2;
use filmcraft_project::{EffectInstance, Interpolation, Keyframe, ParamValue};
use filmcraft_time::{TICKS_PER_SECOND, Tick};
use serde_json::json;

const SECS: f64 = 5.0;
const IN: f64 = 0.7;
const OUT: f64 = 0.6;

fn tk(s: f64) -> Tick {
    Tick((s * TICKS_PER_SECOND as f64).round() as i64)
}
fn fx(id: &str) -> EffectInstance {
    filmcraft_project::find_effect(id).expect(id).instance()
}
fn set(e: &mut EffectInstance, id: &str, v: ParamValue) {
    e.params.get_mut(id).unwrap_or_else(|| panic!("{id}")).value = v;
}
fn key(s: f64, v: ParamValue, interp: Interpolation, out_inf: f64, in_inf: f64) -> Keyframe {
    let mut k = Keyframe::new(tk(s), v);
    k.interp = interp;
    k.out_influence = out_inf;
    k.in_influence = in_inf;
    k
}
/// Intro: `from` → `rest`, decelerating. Outro: `rest` → `to`, accelerating.
fn anim(e: &mut EffectInstance, id: &str, out: bool, a: ParamValue, b: ParamValue) {
    use Interpolation::*;
    let third = 1.0 / 3.0;
    let keys = if out {
        vec![key(SECS - OUT, a.clone(), EaseOut, 0.9, third), key(SECS, b, Linear, third, third)]
    } else {
        vec![key(0.0, a.clone(), Linear, third, third), key(IN, b, EaseIn, third, 0.9)]
    };
    let p = e.params.get_mut(id).unwrap_or_else(|| panic!("{id}"));
    p.value = a;
    p.keyframes = keys;
}
fn f(v: f64) -> ParamValue {
    ParamValue::Float(v)
}
fn pt(x: f64, y: f64) -> ParamValue {
    ParamValue::Vec2(Vec2::new(x, y))
}
/// A Transform effect pinned to the frame centre, so its position offsets the clip.
fn transform() -> EffectInstance {
    let mut t = fx("transform");
    set(&mut t, "anchor", pt(960.0, 540.0));
    set(&mut t, "position", pt(960.0, 540.0));
    t
}
fn preset(name: &str, desc: &str, out: bool, effects: Vec<EffectInstance>) -> EffectPreset {
    EffectPreset {
        name: name.into(),
        description: desc.into(),
        keyframes: if out { KeyframeMode::AnchorToOut } else { KeyframeMode::AnchorToIn },
        source_duration: tk(SECS),
        source_size: (1920, 1080),
        effects,
        builtin: false,
    }
}

fn presets() -> Vec<EffectPreset> {
    let mut v = Vec::new();
    for out in [false, true] {
        let io = if out { "Out" } else { "In" };
        let fade = |e: &mut EffectInstance| {
            if out { anim(e, "opacity", true, f(100.0), f(0.0)) } else { anim(e, "opacity", false, f(0.0), f(100.0)) }
        };

        // 1. Slide Up
        let mut t = transform();
        if out { anim(&mut t, "position", true, pt(960.0, 540.0), pt(960.0, 470.0)) } else { anim(&mut t, "position", false, pt(960.0, 610.0), pt(960.0, 540.0)) }
        fade(&mut t);
        v.push(preset(&format!("Sk Slide Up {io}"), "Monte en apparaissant / continue de monter en disparaissant", out, vec![t]));

        // 2. Smooth Zoom
        let mut t = transform();
        if out { anim(&mut t, "scale_height", true, f(100.0), f(120.0)) } else { anim(&mut t, "scale_height", false, f(70.0), f(100.0)) }
        fade(&mut t);
        v.push(preset(&format!("Sk Smooth Zoom {io}"), "Zoom doux avec fondu", out, vec![t]));

        // 4. Smooth Blur
        let mut b = fx("gaussian_blur");
        if out { anim(&mut b, "blurriness", true, f(0.0), f(40.0)) } else { anim(&mut b, "blurriness", false, f(40.0), f(0.0)) }
        let mut t = transform();
        if out { anim(&mut t, "scale_height", true, f(100.0), f(108.0)) } else { anim(&mut t, "scale_height", false, f(108.0), f(100.0)) }
        fade(&mut t);
        v.push(preset(&format!("Sk Smooth Blur {io}"), "Sort du flou / retourne dans le flou", out, vec![b, t]));

        // 5. Smooth Fade
        let mut t = transform();
        fade(&mut t);
        v.push(preset(&format!("Sk Smooth Fade {io}"), "Fondu doux", out, vec![t]));
    }
    v
}

fn main() {
    let out = std::env::args().nth(1).expect("output dir");
    let path = format!("{out}/Sk Text Animations - presets.json");
    let file = json!({"format": "filmcraft.effect-presets", "version": 1, "presets": presets()});
    std::fs::write(&path, serde_json::to_vec_pretty(&file).unwrap()).unwrap();

    let mut s = Session::default();
    s.execute("file.openDemoProject", json!({})).unwrap();
    let r = s.execute("presets.import", json!({"path": path})).unwrap();
    println!("import: {r}");
    let r = s.execute("graphics.template.apply", json!({"template": "builtin:title-centered", "time": 0, "track": 1})).unwrap();
    println!("apply: {r}");
    let clip = r.get("clip").and_then(|c| c.as_u64()).expect("clip id");
    for name in ["Sk Slide Up In", "Sk Slide Up Out"] {
        s.execute("presets.apply", json!({"preset": name, "clips": [clip]})).unwrap();
    }
    let it = s.active_sequence().unwrap().find_item(filmcraft_project::ClipId(clip)).unwrap().1.clone();
    println!("clip {:?}..{:?}, effects: {:?}", it.start, it.end(), it.effects.iter().map(|e| &e.effect).collect::<Vec<_>>());
    let end = it.end();
    for (i, t) in [it.start + tk(0.15), it.start + tk(2.0), end - tk(0.15)].into_iter().enumerate() {
        s.set_playhead(t);
        let p = format!("{out}/check_{i}.png");
        s.execute("file.exportFrame", json!({"target": "program", "path": p})).unwrap();
    }
}
