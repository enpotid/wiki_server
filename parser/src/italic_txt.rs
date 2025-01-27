pub fn italic_txt (arg:String) -> String {
    let mut result = String::new();
    result.push_str(&format!("<a href='{}'>{}</a>", arg, arg));
    result
}