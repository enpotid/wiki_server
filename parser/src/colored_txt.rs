pub fn colored_txt (arg:String) -> String {
    let (color, text) = arg.split_once("|").unwrap();
    let mut result = String::new();
    if color.starts_with("(") {
        result = String::from(format!("<span style='background:linear-gradient{}; color:transparent; -webkit-background-clip: text;'>{}</span>", color, text));
    } else {
        result = String::from(format!("<span style='color:{};'>{}</span>", color, text));
    }
    result
}