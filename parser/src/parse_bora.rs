use std::ptr::null;

use fancy_regex::Regex;
use warp::filters::method::head;
pub fn parse (contents:&str) -> std::string::String {
    let mut rendered =String::from(contents);
    parse_first(contents, &mut rendered);
    return rendered;
}
pub fn parse_first(contents:&str, buffer:&mut String) {
    parse_comment(buffer);
    parse_header(buffer);
}
fn parse_header(buffer:&mut String) {
    let re = Regex::new(r"\n((={1,6})(#?) ?([^\n]+) \3\2)\n").unwrap();
    let binding = buffer.clone();
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
fn parse_comment (buffer:&mut String) {
    let re = Regex::new(r"\n((##|//)[^\n]+|(/\*[^\*/]+\*/))").unwrap();
    let binding = buffer.clone();
    let result = re.captures_iter(&binding);
    for capture in result {
        *buffer = buffer.replace(capture.unwrap().get(0).unwrap().as_str(), "")
    }
}