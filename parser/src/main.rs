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
    //파서 후크가 파스할 코드를 버퍼에 저장. (파서 후크는 파스가 끝나고 이 버퍼를 업데이트함)
    let mut buff = String::from(buf.as_str());
    //실시간으로 파스된 문자열이 여기에 저장된다.
    let mut temp = String::new();

    //훅의 개수만큼 순회할 예정
    for hook in hookslist.iter() {
        //파스된 문자열이 넣어져 있던 변수를 클리어 (훅의 순회 후에는 buf로 temp가 복사됨. 기존에 있던 데이터가 남아있으면 데이터가 2배~~완전 럭키비키자나~~가 되기 때문에 클리어를 진행)
        temp.clear();
        후크가 파스한 텍스트의 개수. 나중에 문자열 파스 후에 원본에 반영할 때 쓰임
        let mut num_of_args = 0;
        //왜쓰지
        let mut num_of_temps = 0;
        //후크의 파라미터들을 저장. 여기 있던 내용을 후크에게 파라미터로 넘김
        let mut args:Vec<String> = Vec::new();
        //문법의 시작 문자열
        let mut start = "";
        //문법의 끝 문자열
        let mut end = "";
        //해당 후크의 문법을 분석하여 문법의 시작, 끝 문자열을 저장
        let parsed: Option<(&str, &str)> = hook.grammar.split_once("ARG");

        if let Some((startg, endg)) = parsed {
            start = startg;
            end = endg;
        } else {
            println!("No 'ARG' found in the string");
        }
        //문법이랑 원 파스할 문자가 같으면 카운트가 올라가는 변수
        let mut i = 0;
        //문법을 닫을 때
        let mut closei = 0;
        //만약 true면 순회하는 문자열을 args에 저장한다. (문법의 끝 재외)
        let mut in_grammar=false;
        //문법 체크용 길이 2개
        let correct_conut_start = start.len();
        let correct_conut_end = end.len();

        //후크의 순회 시작.
        for ch in buff.chars() {
            //순회하는 문자가 문법의 첫 문자랑 일치하면
            if ch == start.chars().nth(i).unwrap_or('F') && !in_grammar{
                //문법이 일치함으로 카운트 업
                i+=1;
                //문법이 충분히 카운트 되어 시작 문법의 길이. 즉, 후크의 문법이 열리면 args를 만들고 문법 안에 들어왔음을 선언
                if i == correct_conut_start {
                    //이걸 안하면 index 페닉에 걸린다.
                    args.push("".to_string());
                    in_grammar = true;
                }
            } else if in_grammar {
                end의 i(처음 진입 시 0)번째 문자에 접근. 닫는 문법의 시작이라면
                if ch == end.chars().nth(closei).unwrap_or('U') {
                    closei를 감소, 즉, end문법의 chars index를 1 증가시킴으로서 다음 문자가 end의 다음 문자와 일치 하는지 확인한다.
                    i+=1;
                    //문법이 닫혔을 시,
                    if (correct_conut_end == closei) {
                        in_grammar = false;
                        num_of_args += 1;
                        num_of_temps+= 1;
                        i=0;
                        //임시 문자열
                        temp.push_str("ARGㅇㅅㅇ");
                        //임시 문자열의 일련번호
                         temp.push_str(num_of_args.to_string().as_str());
                    }
                //문법이 일치하지 않고, i가 원값이 아닐 시, 즉, i가 전에 문법의 끝이 일치한 적이 있었을 시
                } else if ch != end.chars().nth(closei).unwrap_or('C') && i != correct_conut_end{
                    //문법 문자열은 args에 기록을 남기지 않기에 문법 문자열이 아니라고 판단(전에 이미 문법이 닫힌 걸 판단해서 핸들링 하는 코드가 있기 때문에, 여기서는 무조건 문법 문자열이 아닐 수 밖에 없다)
                    for val in 0..closei{
                        //문자열 복구. 어짜피 이전 내용은 end 문법이링 똑같으니까.
                        args[num_of_args].push(end.chars().nth(val).unwrap_or('K'));
                    }
                    //아까 문자열 복구시 현재 순회하는 문자열은 안넣었기 때문.
                    args[num_of_args].push(ch);
                } else {
                    //~~정규 표현식 쓸껄...~~
                    //만약 다 해당이 안된다. (끝 문법과 관련 없는 텍스트다.) 그러면 그냥 args에 푸쉬
                    args[num_of_args].push(ch);
                }
            // end of in_grammar
            // 시작 문법이랑 일치 하지 않으면 (전에는 일치 했는데)
            } else if ch != start.chars().nth(i).unwrap_or('R') && i != 0 {
                //문자열 복구
                for val in 0..i{
                    temp.push(start.chars().nth(val).unwrap_or('U'));
                }
                temp.push(ch);
            //해당 사항 없다
            } else {
                temp.push(ch);
            }
        }
        //end of parse. But not parserhook iter. Now. args:Vec<String> has the paramiters of fun.
        //and temp has replaced text. (ARGㅇㅅㅇ<일련번호> 그거
        
        let a = String::from(temp.clone());
        let ii = 1;
        for value in args {
            //ARGㅇㅅㅇ 그거 리플레이스 하면 안되는데. ㅈ대따 ㅋㅋ...
           
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