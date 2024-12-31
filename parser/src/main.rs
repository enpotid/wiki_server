use std::fs;

struct ParserHook {
    grammar:String,
    function: fn(String) -> String,
}
fn main() -> std::io::Result<()> {
    // 파일을 읽어들임
    let mut temp: String = String::new();
    let mut temp2: String = String::new();
    let mut temp3: String = String::new();
    let mut temp4: String = String::new();
    let contents: String = fs::read_to_string("test.txt")?;
    let mut hooks:Vec<ParserHook> = Vec::new();
    mkparser_hook("{#ARG}", colorful_txt, &mut hooks);
    mkparser_hook("**ARG**", bold_txt, &mut hooks);
    let (result, nowikilist) = nowiki(contents.clone());
    temp.push_str(result.as_str());
    temp2.push_str(parse(&mut temp, hooks).as_str());
    temp3.push_str(escape_handler(&&temp).as_str());
    // 파일 내용에서 중괄호로 감싸진 부분만 추출하여 배열로 처리
    temp4.push_str(restore(nowikilist,&&temp2).as_str());
    println!("{}", temp4);
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
    let mut buff = String::from(buf.as_str());
    let mut temp = String::new();
    
    for hook in hookslist.iter() {
        temp.clear();
        let mut num_of_args = 0;
        let mut num_of_temps = 0;
        let mut args:Vec<String> = Vec::new();
        let mut start = "";
        let mut end = "";
        let parsed: Option<(&str, &str)> = hook.grammar.split_once("ARG");
        if let Some((startg, endg)) = parsed {
            start = startg;
            end = endg;
        } else {
            println!("No 'ARG' found in the string");
        }
        let mut i = 0;
        let mut in_grammar=false;
        let correct_conut_start = start.len();
        let correct_conut_end = end.len();
        for ch in buff.chars() {
            if ch == start.chars().nth(i).unwrap_or('F') && !in_grammar{
                i+=1;
                if i == correct_conut_start {
                    args.push("".to_string());
                    in_grammar = true;
                }
            } else if in_grammar {
                if ch == end.chars().nth(correct_conut_start-i).unwrap_or('U') {
                    i-=1;
                    if (correct_conut_start > correct_conut_end && i == correct_conut_start - correct_conut_end) || (correct_conut_start <= correct_conut_end && i == 0) {
                        in_grammar = false;
                        num_of_args += 1;
                        num_of_temps+= 1;
                        i=0;
                        temp.push_str("ARGㅇㅅㅇ");
                        temp.push_str(num_of_temps.to_string().as_str());
                    }
                } else if ch != end.chars().nth(correct_conut_start-i).unwrap_or('C') && i < correct_conut_end && i > 0{
                    for val in 0..3-i{
                        args[num_of_args].push(end.chars().nth(val).unwrap_or('K'));
                    }
                    args[num_of_args].push(ch);
                    i=correct_conut_start;
                } else {
                    args[num_of_args].push(ch);
                }
            } else if ch != start.chars().nth(i).unwrap_or('R') && i <= correct_conut_start && i >= 1 {
                for val in 0..i{
                    temp.push(start.chars().nth(val).unwrap_or('U'));
                }
                temp.push(ch);
            } else {
                temp.push(ch);
            }
        }
        //end of parse. But not parserhook iter. Now. args:Vec<String> has the paramiter of fun.
        //and temp has replaced text.
        //lets print it.
        
        let a = String::from(temp.clone());
        let ii = 1;
        for value in args {
            let mut arg: String = String::from("ARGㅇㅅㅇ");
            let _ = arg.push_str(ii.to_string().as_str());
            let valuefinal:String = (hook.function)(value);
            temp = a.replace(&arg, &valuefinal);
            i += 1;
        }
        buff.clear();
        buff.push_str(&temp);
    }
    return temp;
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
                    result.push_str("NOWIKIㅇㅅㅇ");
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
        let mut nowikib: String = String::from("NOWIKIㅇㅅㅇ");
        let _nowiki = nowikib.push_str(i.to_string().as_str());
        result = result.replace(&nowikib, &value);
        i += 1;
    }
    return result;
}