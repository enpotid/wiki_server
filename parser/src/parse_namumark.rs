use std::time::Instant;

use fancy_regex::{Captures, Regex};
pub fn parse (contents:&str, links:Vec<bool>, namespace:&str, title:&str, debug:bool) -> std::string::String {
    let mut rendered =String::from(contents);
    parse_first(&mut rendered, links, namespace, title, debug);
    rendered = rendered[1..rendered.len()-1].to_owned();
    return rendered.replace("\n", "<br>");
}
pub fn parse_first(buffer:&mut String, links:Vec<bool>, ns:&str, title:&str, debug:bool) {
    let isdark = true;
    parse_comment(buffer);
    parse_link(buffer, links, ns, title);
    let triple_time = Instant::now();
    parse_triple(buffer, isdark, ns, title);
    if debug == true {
        println!("{:?}", triple_time.elapsed());
    }
    parse_header(buffer);
    parse_backslash(buffer);
    parse_table(buffer);
    parse_reference(buffer);
    parse_list(buffer);
    parse_markup(buffer);
    *buffer = buffer.replace("[펼접]", "[ 펼치기 · 접기 ]")
}
fn parse_markup(buffer:&mut String) {
    parse_markup_bold(buffer);
}
fn parse_markup_bold(buffer:&mut String) {
    let binding = buffer.clone();
    let bold_regex = Regex::new(r"'''((?:(?!''').)+)'''").unwrap();
    for cap in bold_regex.captures_iter(&binding) {
        let cap = cap.unwrap();
        *buffer = buffer.replacen(cap.get(0).unwrap().as_str(), 
        &format!("<b>{}</b>", cap.get(1).unwrap().as_str()), 1)
    }
}
fn parse_list(buffer:&mut String) {
    let regex = Regex::new(r"(?:\n(?: *)\*(?:.*))+").unwrap();
    let rege = Regex::new(r"( *)\*(.*)").unwrap();
    let binding = buffer.clone();
    for cap in regex.find_iter(&binding) {
        let mut lastlevel: usize = 0;
        let cap = cap.unwrap();
        let mut result = String::new();
        for lin in cap.as_str().lines() {
            for cap in rege.captures_iter(lin) {
                let cap = cap.unwrap();
                let level: usize = cap.get(1).unwrap().as_str().len();
                let content = cap.get(2).unwrap().as_str();
                
                if lastlevel == level {
                    result.push_str(&format!("<li>{}</li>", content));
                } else {
                    if lastlevel > level {
                        for _ in level..lastlevel {
                            result.push_str("</ul>");
                        }
                        result.push_str(&format!("<li>{}</li>", content));
                    } else {
                        for _ in lastlevel..level {
                            result.push_str("<ul>");
                        }
                        result.push_str(&format!("<li>{}</li>", content));
                    }
                    lastlevel = level
                }
            }
        }
        for _ in 0..lastlevel {
            result.push_str("</ul>");
        }
        
        *buffer = buffer.replacen(cap.as_str(), &format!("<ul>{}</ul>", &result), 1)
    }
}
fn parse_reference(buffer:&mut String) {
    let regex = Regex::new(r"\[\*((?:(?! ).)*)? ((?:(?!(?:\[|\])).)*)\]|\[각주\]").unwrap();
    let mut refnum = 1;
    let mut lastref = 1;
    let mut refs:Vec<&str> = Vec::new();
    let binding = buffer.clone();
    for cap in regex.captures_iter(&binding) {
        let cap = cap.unwrap();
        if cap.get(0).unwrap().as_str() == "[각주]" {
            let mut reference = String::new();
            for i in lastref..refnum {
                reference.push_str(&format!("<div tabindex=\"0\" id=\"r{}\" class=\"caki-reference\"><a href=\"#br{}\">[{}]</a> {}</div>", i, i, i, refs[i-1]));
            }
            *buffer = buffer.replacen("[각주]", &reference, 1);
            reference.clear();
            lastref = refnum
        } else {
            let name = cap.get(1).unwrap().as_str();
            let content = cap.get(2).unwrap().as_str();
            if name == "" {
                *buffer = buffer.replacen(cap.get(0).unwrap().as_str(), &format!("<sup><a id=\"br{}\" href=\"#r{}\">[{}]</a></sup>", refnum, refnum, refnum), 1);
                refs.push(content);
                refnum += 1;
            } 
        }
    }
    let mut reference = String::new();
    for i in lastref..refnum {
        reference.push_str(&format!("<div id=\"r{}\" tabindex=\"0\" class=\"caki-reference\"><a href=\"#br{}\">[{}]</a> {}</div>", i, i, i, refs[i-1]));
    }
    reference.push_str("\n");
    let mut binding2 = buffer.clone();
    binding2.push_str(&reference);
    *buffer =binding2;
}
fn parse_table (buffer:&mut String) {
    let binding: String = buffer.clone();
    let mut st: String = String::from("<tr>");
    let reg = Regex::new(r"\n((?:\|\|)+((?!\n\n\|\|)[\s\S])+\|\|\n)+").unwrap(); //오픈나무 코드 읽기 힘들어서 그냥 내가 만듦
    for cap in reg.captures_iter(&binding) {
        let rege: Regex = Regex::new(r"(\n?)((?:\|\|)+)((?:<(?:(?:(?!<|>).)+)>)*)((?:\n*(?:(?:(?:(?!\|\|).)+)\n*)+)|(?:(?:(?!\|\|).)*))").unwrap();
        // 원본 코드에서는 table_sub_regex이던데 과연
        //table-substract일까 아님
        //table-sub (서브)일까...
        let cap: Captures<'_> = cap.unwrap();
        for cap in rege.captures_iter(cap.get(0).unwrap().as_str()) {
            let cap = cap.unwrap();
            let mut colspan = (cap.get(2).unwrap().as_str().len()/2).to_string();
            let mut rowspan = "";
            let mut style = String::new();
            let mut attr = String::new();
            let str = cap.get(3).unwrap().as_str();
            if str != "" {
                let sliced = &str[1..str.len()-1];
                let parsed = sliced.split("><");
                for e in parsed {
                    if e.starts_with("-") {
                        colspan = (&e[1..]).to_string();
                    } else if e.starts_with("|") {
                        rowspan = &e[1..];
                    } else if e.starts_with("bgcolor=") {
                        style.push_str(&format!("background:{}; ", &e[8..]));
                    } else if e.starts_with("width=") { //magic numbers!
                        style.push_str(&format!("width:{}", &e[6..]));
                    } else if e == "nopad" { //magic numbers!
                        style.push_str(&format!("padding:0px"));
                    }
                }
            }
            if cap.get(4).unwrap().as_str().starts_with(" ") && cap.get(4).unwrap().as_str().ends_with(" ") {style.push_str("text-align:center; ");}
            if cap.get(4).unwrap().as_str().starts_with(" ") && !cap.get(4).unwrap().as_str().ends_with(" ") {style.push_str("text-align:right; ");}
            attr.push_str(&format!("colspan=\"{}\" ", &colspan));
            if style.is_empty() != true {attr.push_str(&format!("style=\"{}\"", &style));}
            if rowspan != "" {
                attr.push_str(&format!("rowspan=\"{}\" ", rowspan));
            }
            if cap.get(4).unwrap().as_str() == "" {
                st.push_str(&format!("</tr><tr>"));
            } else {
                st.push_str(&format!("<td {}>{}</td>",attr, cap.get(4).unwrap().as_str()));
            }
        }
        *buffer = buffer.replacen(cap.get(0).unwrap().as_str(), &format!("<table>{}</table>", &st[0..st.len() - 4]), 1);
    }
}
fn parse_link (buffer:&mut String, links:Vec<bool>, ns:&str, title:&str) {
    let mut categorys = String::from("<div id=\"CakiCategorysBox\" class=\"caki-categorys-box\"><button class=\"caki-category-extend\" id=\"caki-category-btn\" onclick=\"CakiExtendCategory()\">(+)</button>");
    let re = Regex::new(r"\[\[(((?!\[\[|\]\]|\n).|\n)*)\]\]").unwrap();
    let mut i = 0;
    while links.len() > i {
        let binding = buffer.clone();
        for cap in re.captures_iter(&binding) {
            let cap = cap.unwrap();
            let a = cap.get(1).unwrap().as_str();
            let parsed = a.split_once("|");
            match parsed {
                Some((b, a)) => {
                    if b.starts_with("https://") || b.starts_with("http://") {
                        *buffer = buffer.replacen(cap.get(0).unwrap().as_str(), &format!("<a style=\"color:green\" href=\"{}\"><span>(外)</span>{}</a>", b, a), 1)
                    } else if b.starts_with("category:") {
                        if links[i] == false {
                            categorys.push_str(&format!("<a class=\"catlink\" style=\"color:red\" href=\"/w/{b}\">{a}</a>"));
                        } else {
                            categorys.push_str(&format!("<a class=\"catlink\" href=\"/w/{b}\">{a}</a>"));
                        }
                        *buffer = buffer.replacen(cap.get(0).unwrap().as_str(), "", 1);
                        
                    } else if links[i] == false {
                        *buffer = buffer.replacen(cap.get(0).unwrap().as_str(), &format!("<a style=\"color:red;\" href=\"/w/{}\">{}</a>", b, a), 1)
                    } else if b.starts_with("file:") {
                        let parsed = b.split_once(":");
                        match parsed {
                            Some((_, name)) => {
                                *buffer = buffer.replacen(cap.get(0).unwrap().as_str(), &format!("<img src=\"/api/image/{}\" {a} style=\"vertical-align: bottom;\">", name), 1)
                            },
                            None => {

                            }
                        }
                    } else if b == format!("{}:{}",ns, title) {
                        *buffer = buffer.replacen(cap.get(0).unwrap().as_str(), &format!("<b><a href=\"/w/{}\">{}</a></b>", b, a), 1)
                    } else {
                        *buffer = buffer.replacen(cap.get(0).unwrap().as_str(), &format!("<a href=\"/w/{}\">{}</a>", b, a), 1)
                    }
                    
                },
                None => {
                    if a.starts_with("https://") || a.starts_with("http://") {
                        *buffer = buffer.replacen(cap.get(0).unwrap().as_str(), &format!("<a style=\"color:green\" href=\"{}\"><span>(外)</span>{}</a>", a, a), 1)
                    } else if a.starts_with("category:") {
                        if links[i] == false {
                            categorys.push_str(&format!("<a class=\"catlink\" style=\"color:red\" href=\"/w/{}\">{}</a>",a, &a[9..]));
                        } else {
                            categorys.push_str(&format!("<a class=\"catlink\" href=\"/w/{}\">{}</a>",a, &a[9..]));
                        }
                        *buffer = buffer.replacen(cap.get(0).unwrap().as_str(), "", 1);
                    } else if links[i] == false {
                        *buffer = buffer.replacen(cap.get(0).unwrap().as_str(), &format!("<a style=\"color:red\" href=\"/w/{}\">{}</a>", a, a), 1)
                    } else if a.starts_with("file:") {
                        let parsed = a.split_once(":");
                        match parsed {
                            Some((_, a)) => {
                                *buffer = buffer.replacen(cap.get(0).unwrap().as_str(), &format!("<img src=\"/api/image/{}\" style=\"vertical-align: bottom;\">", a), 1)
                            },
                            None => {

                            }
                        }
                    } else if a == format!("{}:{}",ns, title) {
                        *buffer = buffer.replacen(cap.get(0).unwrap().as_str(), &format!("<b><a href=\"/w/{}\">{}</a></b>", a, a), 1)
                    } else {
                        *buffer = buffer.replacen(cap.get(0).unwrap().as_str(), &format!("<a href=\"/w/{}\">{}</a>", a, a), 1)
                    }
                }
            }
            i += 1;
        }
    }
    categorys.push_str("</div>");
    if categorys != "<div id=\"CakiCategorysBox\" class=\"caki-categorys-box\"><button class=\"caki-category-extend\" id=\"caki-category-btn\" onclick=\"CakiExtendCategory()\">(+)</button></div>" {
        categorys.push_str(&buffer[1..]);
        categorys.insert_str(0, "\n");
        *buffer = categorys;
    }
}
fn parse_header(buffer:&mut String) {
    let mut levelstrek = 1;
    let mut context = String::from("<ul class=\"caki-context-box\">");
    let re = Regex::new(r"((={1,6})(#?) ?([^\n]+) \3\2)").unwrap();
    let binding = buffer.clone();
        let mut ans: Vec<String> = Vec::new();
        let mut maxes: Vec<usize> = Vec::new();
        let mut max = 1;
        let mut headerstack = [false; 6]; //이게 더시드고 그렇고 내가 원하는 기능이 없드라
    for binding in binding.lines() {
        let result = re.captures_iter(&binding);
        for captures in result {
            let mut divs = String::new();
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
            if levelstrek != level {
                context.push_str(&format!("<li class=\"caki-context-level-{}\"><a href=\"#h{}\">{}</a> {}</li>", level, contextid, contextid, title));
                levelstrek = level
            }
            for stackpoint in level..7 {
                if headerstack[stackpoint-1] == true {
                    headerstack[stackpoint-1] = false;
                    divs.push_str("</div>");
                }
            }
            ;
            headerstack[level-1] = true;
            
                *buffer = buffer.replacen(cap.get(1).unwrap().as_str(), &format!(
                    "{}<h{} id=\"h{}\" class=\"caki_header\" onclick=\"foldUnfoldHeader('{}')\"><a>{}.</a>　{}</h1><div id=\"{}\" style=\"display:{}\">"
                , divs, level,  contextid,contextid.clone(), contextid, title, contextid, fold), 1);
        }
    }
    context.push_str("</ul>\n");
    if !(buffer.contains("[nocontext]") ||
       !buffer.contains("[목차제거]")) ||
       !context.starts_with("<ul class=\"caki-context-box\"></ul>")
    {
        if buffer.contains("[목차]") || buffer.contains("[context]") {
            *buffer = buffer
            .replace("[목차]", &context)
            .replace("[context]", &context)
        } else {
            context.push_str(&buffer[1..]);
            context.insert_str(0, "\n");
            *buffer = context;
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
fn parse_triple (buffer:&mut String, isdark:bool, ns:&str, title:&str) {
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
                triple_wiki(cap.get(0).unwrap().as_str(), cap.get(3).unwrap().as_str(), &mut binding, isdark, ns, title/*나중에 바꿀 예정... 근데 개귀찮 */);
            } else if triplename == "#!folding" {
                triple_folding(cap.get(0).unwrap().as_str(), cap.get(3).unwrap().as_str(), &mut binding, ns, title)
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
fn triple_wiki (full:&str, content:&str, buffer:&mut String, isdark:bool, ns:&str, title:&str) {
    let (attr, body) = content.split_once("\n").unwrap_or_default();
    let parsed = parse(&format!("\n{}\n", body), vec![], ns, title, false);
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
    *buffer = buffer.replacen(full, format!("<div style=\"{}\">{}</div>", style, parsed).as_str(), 1); 
}
fn triple_folding (full:&str, content:&str, buffer:&mut String, ns:&str, titlee:&str) {
    let (title, body) = content.split_once("\n").unwrap_or_default();
    let parsed = parse(&format!("\n{}\n", body), vec![], ns, titlee, false);
    *buffer = buffer.replacen(full, format!("<dl><dt style=\"cursor: pointer;\" onclick=\"toggleDD()\">{}</dt><dd style=\"display:none\">{}</dd></dl>", title, parsed).as_str(), 1); 
}
fn nowiki(input: &str) -> Vec<String> {
    let _ = input;
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