pub fn colored_txt (arg:String) -> String {
    let (color, text) = arg.split_once("|").unwrap_or(("black", &arg));
    let mut result = String::new();
    let mut is_hex = true;
    for ch in color.chars() {
        if !ch.is_digit(16) {
            is_hex = false;
        }
    }
    if color.starts_with("(") {
        result = String::from(format!("<span style='background:linear-gradient{}; color:transparent; -webkit-background-clip: text;'>{}</span>", color, text));
    } else if (color.len() == 6 || color.len() == 4 || color.len() == 3) && (is_hex) {
        result = String::from(format!("<span style='color:#{};'>{}</span>", color, text));
    } else {
        result = String::from(format!("<span style='color:{};'>{}</span>", color, text));
    }
    result
}