pub fn inline_parser(start:&str,end:&str,func:fn (arg:String) -> String, to_parse:&mut String) {
    let mut temp = String::new();
    let mut arg = String::new();
    let mut i = 0;
    let mut grammari = 0;
    let mut countin:usize = 0;
    let correct_size_start = start.len();
    let correct_size_end = end.len();
    let mut argstmp:Vec<String> = Vec::new();
    for ch in to_parse.chars() {
        if ch == start.chars().nth(i).unwrap() && countin == 0 {
            i += 1;
            temp.push(ch);
            if i == correct_size_start {
                i = 0;
                countin += 1;
                for _ in 0..correct_size_start {
                    temp.remove(temp.len()-1);
                }
            }
        } else if countin > 0 {
            if ch == start.chars().nth(i).unwrap() {
                i += 1;
                //countin - 1 = 문법 1번 진입 시 0
                arg.push(ch);
                if i == correct_size_start {
                    i = 0;
                    grammari = 0;
                    for _ in 0..correct_size_start {
                        arg.remove(arg.len()-1);
                    }
                    if argstmp.len() == countin-1 {
                        argstmp.push(arg.clone());
                    } else {
                        argstmp[countin-1] = arg.clone();
                    }
                    countin += 1;
                    arg.clear();
                }
            } else if ch == end.chars().nth(grammari).unwrap() {
                grammari += 1;
                arg.push(ch);
                if grammari == correct_size_end {
                    countin -= 1;
                    if countin == 0 {
                        grammari = 0;
                        i = 0;
                        for _ in 0..correct_size_end {
                            arg.remove(arg.len()-1);
                        }
                        temp.push_str(func(arg.clone()).as_str());
                        if argstmp.len() != 0 {
                            argstmp[0].clear();
                        }
                        arg.clear();
                    } else {
                        grammari = 0;
                        i = 0;
                        for _ in 0..correct_size_end {
                            arg.remove(arg.len()-1);
                        }
                        argstmp[countin-1].push_str(func(arg.clone()).as_str());
                        arg.clear();
                        arg.push_str(&argstmp[countin-1]);
                        if argstmp.len()-1 == countin {
                            argstmp[countin].clear();
                        }
                    }
                }
            } else if ch != start.chars().nth(grammari).unwrap() && grammari != 0{
                grammari = 0;
                arg.push(ch);
            } else {
                arg.push(ch);
            }
        } else {
            i = 0;
            temp.push(ch);
        }
    }
    *to_parse = temp;
}