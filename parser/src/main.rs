mod inline_parser;
mod short_parser;
use std::fs;
use inline_parser::inline_parser;
use serde::{Deserialize, Serialize};
use short_parser::short_parser;
use warp::Filter;
mod bold_txt;
mod colored_txt;
mod italic_txt;
mod underlined_txt;
struct ParserHook {
    grammar:String,
    function: fn(String) -> String,
    grammartype:String
}
#[derive(Debug, Deserialize, Serialize)]
struct RequestData {
    contents: String,
}

#[tokio::main]
async fn main() -> std::io::Result<()> {
    // POST 요청에서 contents를 받는 endpoint를 설정합니다.
    let post_route = warp::post()
        .and(warp::path("process"))
        .and(warp::body::json()) // JSON 형태로 데이터를 받음
        .map(|data: RequestData| {
            // 받은 contents를 처리하는 로직
            let mut temp: String = String::new();
            let mut temp2: String = String::new();
            let mut temp3: String = String::new();
            let mut temp4: String = String::new();
            let mut contents = data.contents;
            contents = contents.replace("<", "&lt;");
            let mut hooks: Vec<ParserHook> = Vec::new();
            mkgrammar_hook("{#ARG}", colored_txt::colored_txt, &mut hooks, "inline");
            mkgrammar_hook("**ARG**", bold_txt::bold_txt, &mut hooks, "short");
            mkgrammar_hook("*ARG*", italic_txt::italic_txt, &mut hooks, "short");
            mkgrammar_hook("__ARG__", underlined_txt::underlined_txt, &mut hooks, "short");
            mkgrammar_hook("--ARG--", italic_txt::italic_txt, &mut hooks, "short");
            mkgrammar_hook("~~ARG~~", italic_txt::italic_txt, &mut hooks, "short");
            let (result, nowikilist) = nowiki(contents.clone());
            temp.push_str(result.as_str());
            temp2.push_str(parse(&mut temp, &hooks).as_str());
            temp3.push_str(escape_handler(&&temp2).as_str());
            // 파일 내용에서 중괄호로 감싸진 부분만 추출하여 배열로 처리
            temp4.push_str(restore(nowikilist, &&temp3).as_str());
            
            // 결과를 JSON 형식으로 반환
            warp::reply::json(&temp4)
        });

    // 서버 실행
    let addr = ([127, 0, 0, 1], 34879);
    warp::serve(post_route)
        .run(addr)
        .await;

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
fn mkgrammar_hook (grammar:&str, function:fn (arg:String) -> String, hookslist:&mut Vec<ParserHook>, grammartype: &str) {
    hookslist.push(ParserHook{
        grammar:grammar.to_string(),
        function:function,
        grammartype:grammartype.to_owned()
    });
}
fn parse (buf:&mut String, hookslist:&Vec<ParserHook>) -> String {
    let buff: &mut String = buf;
    let (mut start, mut end) = ("", "");
    for hook in hookslist {
        if let Some((part1, part2)) = hook.grammar.split_once("ARG") {
            start = part1;
            end = part2;
        } else {
            println!("구분자가 없습니다.");

        }
        //메치문이 어렵네 ㅇㅅㅇ
        if hook.grammartype == "inline" {
            inline_parser(start, end, hook.function, buff);
        } else if hook.grammartype == "short" {
            short_parser(start, end, hook.function, buff);
        } else {
            inline_parser(start, end, hook.function, buff);
        }
    }
    return buff.to_string();
}

fn nowiki (string:String) -> (String, Vec<String>) {
    let mut in_brace = false;
    let mut result = String::new();
    let mut nowiki:Vec<String> = Vec::new();
    let mut num_of_nowiki = 0;
    let mut brace_count:usize = 0;
    for ch in string.chars() {
        if ch == '{' && !in_brace{
            brace_count+=1;
            if brace_count == 3 {
                in_brace = true;
                nowiki.push("".to_string());
            }
        } else if in_brace {
            if ch == '}' {
                brace_count-=1;
                if brace_count == 0 {
                    num_of_nowiki += 1;
                    result.push_str("놄윒킶 읾싢 텏슭틆");
                    result.push_str(num_of_nowiki.to_string().as_str());
                    in_brace = false;
                }
            } else if ch != '}' && brace_count < 3 && brace_count > 0{
                for _ in 0..3-brace_count{
                    nowiki[num_of_nowiki].push_str("}");
                }
                nowiki[num_of_nowiki].push(ch);
                brace_count=3;
            } else {
                nowiki[num_of_nowiki].push(ch);
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
    return (result, nowiki);
}
fn restore (nowikilist:Vec<String>, temp:&str) -> String {
    let mut result = String::from(temp);
    let mut i = 1;
    for value in nowikilist {
        let mut nowikib: String = String::from("놄윒킶 읾싢 텏슭틆");
        let _nowiki = nowikib.push_str(i.to_string().as_str());
        result = result.replace(&nowikib, &value);
        i += 1;
    }
    return result;
}