use std::{fs, result};

struct ParserHook {
    grammar:String,
    function: fn(Vec<String>),
}
fn main() -> std::io::Result<()> {
    // 파일을 읽어들임
    let mut temp: String = String::new();
    let mut temp2: String = String::new();
    let contents: String = fs::read_to_string("test.txt")?;
    let hooks:Vec<ParserHook> = Vec::new();
    mkparser_hook("{#ARG1|ARG2}", colorful_txt, hooks);
    temp.push_str(nowiki(contents.clone()).as_str());
    //parse(&mut temp);
    temp2.push_str(escape_handler(&&temp).as_str());
    // 파일 내용에서 중괄호로 감싸진 부분만 추출하여 배열로 처리
    println!("{}", temp2);
    // 결과 출력

    Ok(())
}

// 중괄호로 감싸인 부분만 추출하는 함수
fn escape_handler(input: &str) -> String {
    let mut result: String = String::new();  // 결과 문자열 초기화

    let mut chars: std::str::Chars<'_> = input.chars(); // 문자 이터레이터

    while let Some(ch) = chars.next() {
        if ch == '\\' {
            if let Some(next_ch) = chars.next() {
                result.push(next_ch);
            }
        } else {
            result.push(ch);
        }
    }

    result
}
fn mkparser_hook (grammar:&str, function:fn (arg:Vec<String>), mut hookslist:Vec<ParserHook>) {
    hookslist.push(ParserHook{
        grammar:grammar.to_string(),
        function
    });
}
fn colorful_txt (arg:Vec<String>) {

}
fn parse (buf:&mut String) {
    
}
fn nowiki (string:String) -> String {
    let mut in_brace = false;
    let mut result = String::new();
    let mut brace_count:usize = 0;
    for ch in string.chars() {
        if ch == '{' && !in_brace{
            brace_count+=1;
            if brace_count == 3 {
                in_brace = true;
            }
        } else if in_brace {
            if ch == '}' {
                brace_count-=1;
                if brace_count == 0 {
                    in_brace = false;
                }
            } else if ch != '}' && brace_count < 3 && brace_count > 0{
                for _ in 0..3-brace_count{
                    result.push_str("}");
                }
                result.push(ch);
                brace_count=3;
            } else {
                result.push(ch);
            }
        } else if ch != '{' && brace_count <= 3 && brace_count >= 1 {
            for _ in 0..brace_count{
                result.push_str("{");
            }
            result.push(ch);
            brace_count=0;
        } else {
            result.push(ch);
        }
    }
    return result;
}