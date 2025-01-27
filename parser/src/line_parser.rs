pub fn line_parser(start:&str,end:&str,func:fn (arg:String) -> String, to_parse:&mut String) {
    let mut result = String::new();
    for line in to_parse.lines() {
        if line.starts_with(start) && line.ends_with(end) {
            let arg1 = &line[start.len()..]; // 유니코드 문자를 안전하게 자르기
            let arg2 = &arg1[..arg1.len() - end.len()];
            result.push_str(&func(arg2.to_string()));
        } else {
            result.push_str(&format!("{}\n\r", line));
        }
    }
    *to_parse = result
}