pub fn bold_txt (arg:String) -> String {
    let mut result = String::new();
    result.push_str(&format!("<b>{}</b>", arg));
    result
}