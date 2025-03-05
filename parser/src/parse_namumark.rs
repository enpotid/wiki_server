use std::{io::{stdin, stdout, Write}, ptr::null, result};

use fancy_regex::{Captures, Regex};
use warp::filters::method::head;
pub fn parse (contents:&str) -> std::string::String {
    let mut rendered =String::from(contents);
    parse_first(contents, &mut rendered);
    return rendered;
}
pub fn parse_first(contents:&str, buffer:&mut String) {
    let isdark = true;
    parse_comment(buffer);
    parse_triple(buffer, isdark);
    parse_header(buffer);
    parse_backslash(buffer);
    *buffer = buffer.replace("[펼접]", "[ 펼치기 · 접기 ]")
}
fn parse_header(buffer:&mut String) {
    let re = Regex::new(r"((={1,6})(#?) ?([^\n]+) \3\2)").unwrap();
    let binding = buffer.clone();
    for binding in binding.lines() {
        let result = re.captures_iter(&binding);
        let mut i:usize = 0;
        let mut ans: Vec<String> = Vec::new();
        let mut maxes: Vec<usize> = Vec::new();
        let mut max = 1;
        let mut headerstack = [false; 6]; //이게 더시드고 그렇고 내가 원하는 기능이 없드라
        for captures in result {
            let mut divs = String::new();
            i += 1;
            let cap = captures.unwrap();
            let level = cap.get(2).unwrap().as_str().len();
            let mut fold = "block";
            if cap.get(3).unwrap().as_str() == "#" {fold = "none"}
            let title = cap.get(4).unwrap().as_str();
            for _ in maxes.len()..level {
                maxes.push(0);
            }
            maxes[level - 1] += 1;
            let contextid =
            maxes
                .iter()
                .take(level)
                .map(|x| x.to_string())
                .collect::<Vec<String>>()
                .join(".");
            ans.push(contextid.clone());
            if level < max {
                maxes = maxes[..level].to_vec();
            }
            max = level;
            for stackpoint in level..7 {
                if headerstack[stackpoint-1] == true {
                    headerstack[stackpoint-1] = false;
                    divs.push_str("</div>");
                }
            }
            headerstack[level-1] = true;
                *buffer = buffer.replacen(cap.get(1).unwrap().as_str(), &format!(
                    "{}<h{} class=\"caki_header\" onclick=\"foldUnfoldHeader('{}')\"><a>{}.</a>　{}</h1><div id=\"{}\" style=\"display:{}\">"
                , divs, level, contextid.clone(), contextid, title, contextid, fold), 1);
        }
    }
}
fn parse_comment (buffer:&mut String) {
    let re = Regex::new(r"\n((##|//)[^\n]+|(/\*[^\*/]+\*/))").unwrap();
    let binding = buffer.clone();
    let result = re.captures_iter(&binding);
    for capture in result {
        *buffer = buffer.replace(capture.unwrap().get(0).unwrap().as_str(), "")
    }
}
fn parse_triple (buffer:&mut String, isdark:bool) {
    //전에 만들었던 inline_parser쓰는것이 성능이 더 좋을수도. 재귀 쓸꺼임
    let mut binding = buffer.clone();
    /*for a in nowiki(&binding.clone()) {
        let slice = &a[3..a.len()-3];
        let mut res = String::new();
        for ch in slice.chars() {
            res.push_str("\\");
            res.push(ch);
        }
        binding = binding.replacen(&a, &res, 1)
    }*/

    let mut looploop = true; //와 개떡같은 제귀의 시작!
    while looploop == true {
        let binddddddddddding = binding.clone();
        let re = Regex::new(r"\{\{\{(((?!{{{|}}}|\s).|\n)*)(\s(((?!{{{|}}}).|\n)*))\}\}\}").unwrap();
        let result = re.captures_iter(&binddddddddddding);
        //let fucked = true wow
        looploop = false;
        for captures in result {
            let cap = captures.unwrap();
            stdout().flush();
            let triplename = cap.get(1).unwrap().as_str();
            if triplename == "#!light" {
                if isdark == false {
                    binding = binding.replacen(cap.get(0).unwrap().as_str(), cap.get(3).unwrap().as_str(), 1)
                } else {
                    binding = binding.replacen(cap.get(0).unwrap().as_str(), "", 1)
                }
            } else if triplename == "#!dark" {
                if isdark == true {
                    binding = binding.replacen(cap.get(0).unwrap().as_str(), cap.get(3).unwrap().as_str(), 1)
                } else {
                    binding = binding.replacen(cap.get(0).unwrap().as_str(), "", 1)
                }
            } else if triplename == "#!wiki" {
                triple_wiki(cap.get(0).unwrap().as_str(), cap.get(3).unwrap().as_str(), &mut binding, isdark/*나중에 바꿀 예정... 근데 개귀찮 */);
            } else if triplename == "#!folding" {
                triple_folding(cap.get(0).unwrap().as_str(), cap.get(3).unwrap().as_str(), &mut binding)
            } else if triplename == "#!math" {
                binding = binding.replacen(cap.get(0).unwrap().as_str(), "Wow you'are good at math!{{{#248790 \"math is not good at our health...\"}}}", 1)
            }  else if triplename == "+1" {
                binding = binding.replacen(cap.get(0).unwrap().as_str(), format!("<span style=\"font-size:110%; line-height: 1em\">{}</span>", cap.get(3).unwrap().as_str()).as_str(), 1)
            } else if triplename == "+2" {
                binding = binding.replacen(cap.get(0).unwrap().as_str(), format!("<span style=\"font-size:120%; line-height: 1em\">{}</span>", cap.get(3).unwrap().as_str()).as_str(), 1)
            } else if triplename == "+3" {
                binding = binding.replacen(cap.get(0).unwrap().as_str(), format!("<span style=\"font-size:130%; line-height: 1em\">{}</span>", cap.get(3).unwrap().as_str()).as_str(), 1)
            } else if triplename == "+4" {
                binding = binding.replacen(cap.get(0).unwrap().as_str(), format!("<span style=\"font-size:140%; line-height: 1em\">{}</span>", cap.get(3).unwrap().as_str()).as_str(), 1)
            } else if triplename == "+5" {
                binding = binding.replacen(cap.get(0).unwrap().as_str(), format!("<span style=\"font-size:150%; line-height: 1em\">{}</span>", cap.get(3).unwrap().as_str()).as_str(), 1);
            } else if triplename == "-1" {
                binding = binding.replacen(cap.get(0).unwrap().as_str(), format!("<span style=\"font-size:90%; line-height: 1em\">{}</span>", cap.get(3).unwrap().as_str()).as_str(), 1)
            } else if triplename == "-2" {
                binding = binding.replacen(cap.get(0).unwrap().as_str(), format!("<span style=\"font-size:80%; line-height: 1em\">{}</span>", cap.get(3).unwrap().as_str()).as_str(), 1)
            } else if triplename == "-3" {
                binding = binding.replacen(cap.get(0).unwrap().as_str(), format!("<span style=\"font-size:70%; line-height: 1em\">{}</span>", cap.get(3).unwrap().as_str()).as_str(), 1)
            } else if triplename == "-4" {
                binding = binding.replacen(cap.get(0).unwrap().as_str(), format!("<span style=\"font-size:60%; line-height: 1em\">{}</span>", cap.get(3).unwrap().as_str()).as_str(), 1)
            } else if triplename == "-5" {
                binding = binding.replacen(cap.get(0).unwrap().as_str(), format!("<span style=\"font-size:50%; line-height: 1em\">{}</span>", cap.get(3).unwrap().as_str()).as_str(), 1);
            } else {
                let mut color = false;
                let colorre = Regex::new(r"(#([A-Fa-f0-9]{3}){1,2})(,#([A-Fa-f0-9]{3}){1,2})?$").unwrap();
                let resul = colorre.captures_iter(triplename);
                    for capp in resul {
                        let capp = capp.unwrap();
                        color = true;
                        let mut color = capp.get(0).unwrap().as_str();
                        if capp.get(3).is_none() == false && isdark == true {
                            color = &capp.get(3).unwrap().as_str()[1..];
                        }
                        binding = binding.replacen(cap.get(0).unwrap().as_str(), format!("<span style=\"color:{}\">{}</span>", color, cap.get(3).unwrap().as_str()).as_str(), 1)
                    }
                    if color == true {
                } else {
                    binding = binding.replacen(cap.get(0).unwrap().as_str(), cap.get(0).unwrap().as_str().replace("{{{", "\\{\\{\\{").as_str(), 1);
                    binding = binding.replacen(cap.get(0).unwrap().as_str(), cap.get(0).unwrap().as_str().replace("}}}", "\\}\\}\\}").as_str(), 1);
                }
            }
            looploop = true
        }
    }
    *buffer = binding;
}
fn triple_wiki (full:&str, content:&str, buffer:&mut String, isdark:bool) {
    let (attr, body) = content.split_once("\n").unwrap_or_default();
    let mut style = "";
    let mut atttr = String::from(" ");
    atttr.push_str(attr);
    atttr = atttr.replace("파서따움표", "\\파\\서\\따\\움\\표");
    atttr = atttr.replace("\"", "파서따움표"); //정규식에 " 못넣드라. 왜???
    let re = Regex::new(r" style=파서따움표(.*)파서따움표").unwrap();
    let result = re.captures(&atttr).unwrap();
        if !result.is_none() {
            style = result.unwrap().get(1).unwrap().as_str();
        }
    if isdark == true {
        let re = Regex::new(r" dark-style=파서따움표([^\n|^&quot]+)파서따움표 ").unwrap();
        let result = re.captures(&atttr).unwrap();
        if !result.is_none() {
            style = result.unwrap().get(1).unwrap().as_str();
        }
    }
    *buffer = buffer.replacen(full, format!("<div style=\"{}\">{}</div>", style, body).as_str(), 1); 
}
fn triple_folding (full:&str, content:&str, buffer:&mut String) {
    let (title, body) = content.split_once("\n").unwrap_or_default();
    *buffer = buffer.replacen(full, format!("<dl><dt style=\"cursor: pointer;\" onclick=\"toggleDD()\">{}</dt><dd style=\"display:none\">{}</dd></dl>", title, body).as_str(), 1); 
}
fn nowiki(input: &str) -> Vec<String> {
    let result: Vec<String> =  Vec::new();
    result
    //뭐 나중에 구현할 예정
}
fn parse_backslash(buffer:&mut String) {
    let mut result = String::new();
    let mut chars = buffer.chars().peekable();

    while let Some(c) = chars.next() {
        if c == '\\' {
            if let Some(&next_char) = chars.peek() {
                if next_char == '\\' {
                    result.push(c);  // '\\'은 그대로 추가
                    chars.next();  // '\\' 뒤에 또 하나의 '\\' 처리
                } else {
                    continue;  // 뒤에 문자가 있으면 해당 문자만 추가, 백슬래시 제거
                }
            }
        } else {
            result.push(c);
        }
    }
    *buffer = result
}