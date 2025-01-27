pub fn header_1 (arg:String) -> String {
    let mut result = String::new();
    result.push_str(&format!("<h1>{}</h1>", arg));
    result
}