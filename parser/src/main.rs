static mut A:bool = false;
mod structs;
use std::{fs::{self, OpenOptions}, sync::{LazyLock, Mutex}};
use structs::Document;

mod colored_txt;
struct ParserHook {
    grammar: String,
    function: fn(String) -> String,
    grammartype:String
}
fn main() -> std::io::Result<()> {
    // 파일을 읽어들임
    let mut temp: String = String::new();
    let mut temp2: String = String::new();
    let mut temp3: String = String::new();
    let mut temp4: String = String::new();
    let contents: String = fs::read_to_string("test.txt")?;
    let document:Option<Document> = if contents.starts_with("# GRAMMAR_CODE_A") {
        unsafe {A = true;}
        Some(Document::new())
    } else {
        None
    };
    let mut hooks:Vec<ParserHook> = Vec::new();
    mkgrammar_hook("{#ARG}", colored_txt::colored_txt, &mut hooks, "inline");
    mkgrammar_hook("**ARG**", bold_txt, &mut hooks, "inline");
    let (result, nowikilist) = nowiki(contents.clone());
    temp.push_str(result.as_str());
    temp2.push_str(parse(&mut temp, &hooks).as_str());
    temp3.push_str(escape_handler(&&temp).as_str());
    // 파일 내용에서 중괄호로 감싸진 부분만 추출하여 배열로 처리
    temp4.push_str(restore(nowikilist, &&temp2).as_str());
    println!("{}", temp4);
    // 결과 출력

    Ok(())
}

// 중괄호로 감싸인 부분만 추출하는 함수
fn escape_handler(input: &str) -> String {
    let mut result: String = String::new(); // 결과 문자열 초기화

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
fn mkparser_hook (grammar:&str, function:fn (arg:String) -> String, hookslist:&mut Vec<ParserHook>) {
    hookslist.push(ParserHook{
        grammar:grammar.to_string(),
        function:function
    });
}
fn colorful_txt (arg:String) -> String {
    return String::from(arg);
}
fn bold_txt (arg:String) -> String {
    return String::from("Lets Be blod Guys!");
}
fn parse (buf:&mut String, hookslist:Vec<ParserHook>) -> String {

    return temp;
}
fn nowiki(string: String) -> (String, Vec<String>) {
    let mut in_brace = false;
    let mut result = String::new();
    let mut nowiki: Vec<String> = Vec::new();
    let mut num_of_nowiki = 0;
    let mut brace_count: usize = 0;
    for ch in string.chars() {
        if ch == '{' && !in_brace {
            brace_count += 1;
            if brace_count == 3 {
                in_brace = true;
                nowiki.push("".to_string());
            }
        } else if in_brace {
            if ch == '}' {
                brace_count -= 1;
                if brace_count == 0 {
                    num_of_nowiki += 1;
                    result.push_str("NOWIKIㅇㅅㅇ");
                    result.push_str(num_of_nowiki.to_string().as_str());
                    in_brace = false;
                }
            } else if ch != '}' && brace_count < 3 && brace_count > 0 {
                for _ in 0..3 - brace_count {
                    nowiki[num_of_nowiki].push_str("}");
                }
                nowiki[num_of_nowiki].push(ch);
                brace_count = 3;
            } else {
                nowiki[num_of_nowiki].push(ch);
            }
        } else if ch != '{' && brace_count <= 3 && brace_count >= 1 {
            for _ in 0..brace_count {
                result.push_str("{");
            }
            result.push(ch);
            brace_count = 0;
        } else {
            result.push(ch);
        }
    }
    return (result, nowiki);
}
fn restore(nowikilist: Vec<String>, temp: &str) -> String {
    let mut result = String::from(temp);
    let mut i = 1;
    for value in nowikilist {
        let mut nowikib: String = String::from("NOWIKIㅇㅅㅇ");
        let _nowiki = nowikib.push_str(i.to_string().as_str());
        result = result.replace(&nowikib, &value);
        i += 1;
    }
    return result;
}
