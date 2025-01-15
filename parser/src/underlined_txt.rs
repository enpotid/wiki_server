pub fn underlined_txt (arg:String) -> String {
    let mut result = String::new();
    result.push_str(&format!("<span style='text-decoration:underline;'>{}</span>", arg));
    result
}