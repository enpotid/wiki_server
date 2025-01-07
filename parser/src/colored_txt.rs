use crate::{ParserHook, A};

//1중 문법인 경우:248790|asdf -> asdf;<col=blue>
//2중 문법인 경우:248790|asdfStartOfGrammarasdf;<col=red>EndOfGrammarqwer
pub fn colored_txt (arg:String) -> String {
    println!("인풋:{}", arg);
        let result = String::from(arg);
        println!("결과:{}", result);
        result
}

use std::cmp::min;

// 색상 이름과 그에 대응하는 RGB 값 매핑
const COLOR_NAMES: &[(&str, u8, u8, u8)] = &[
    ("black", 0, 0, 0),
    ("red", 255, 0, 0),
    ("green", 0, 255, 0),
    ("yellow", 255, 255, 0),
    ("blue", 0, 0, 255),
    ("magenta", 255, 0, 255),
    ("cyan", 0, 255, 255),
    ("white", 255, 255, 255),
    ("bright_black", 105, 105, 105),
    ("bright_red", 255, 99, 71),
    ("bright_green", 144, 238, 144),
    ("bright_yellow", 255, 255, 224),
    ("bright_blue", 173, 216, 230),
    ("bright_magenta", 255, 182, 193),
    ("bright_cyan", 224, 255, 255),
    ("bright_white", 255, 255, 255),
];

// RGB 색상 값 간의 유클리드 거리 계산 함수
fn color_distance(r1: u8, g1: u8, b1: u8, r2: u8, g2: u8, b2: u8) -> u32 {
    let dr = r1 as i32 - r2 as i32;
    let dg = g1 as i32 - g2 as i32;
    let db = b1 as i32 - b2 as i32;
    (dr * dr + dg * dg + db * db) as u32
}

// Hex 색상 값을 RGB로 변환
fn hex_to_rgb(hex: &str) -> Option<(u8, u8, u8)> {
        let hex = &hex[0..];
        if hex.len() == 6 {
            let r = u8::from_str_radix(&hex[0..2], 16).ok()?;
            let g = u8::from_str_radix(&hex[2..4], 16).ok()?;
            let b = u8::from_str_radix(&hex[4..6], 16).ok()?;
            return Some((r, g, b));
        }
    None
}

// Hex 색상에 가장 가까운 색상 이름을 반환하는 함수
fn closest_color_name(hex: &str) -> Option<&'static str> {
    let (r, g, b) = match hex_to_rgb(hex) {
        Some(rgb) => rgb,
        None => return None,
    };

    let mut closest_color = "white";  // 기본값은 흰색
    let mut min_distance = u32::MAX;

    for &(name, r2, g2, b2) in COLOR_NAMES {
        let distance = color_distance(r, g, b, r2, g2, b2);
        if distance < min_distance {
            min_distance = distance;
            closest_color = name;
        }
    }

    Some(closest_color)
}