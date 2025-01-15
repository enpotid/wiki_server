//무조건 1단계까지만 인식함.
pub fn short_parser(start:&str,end:&str,func:fn (arg:String) -> String, to_parse:&mut String) {
    let mut temp = String::new();
    let mut arg = String::new();
    let mut i = 0;
    let mut countin:bool = false;
    let correct_size_start = start.len();
    let correct_size_end = end.len();
    for ch in to_parse.chars() {
        if ch == start.chars().nth(i).unwrap() && countin == false {
            i += 1;
            temp.push(ch);
            if i == correct_size_start {
                i = 0;
                countin = true;
                for _ in 0..correct_size_start {
                    temp.remove(temp.len()-1);
                }
            }
        } else if countin == true {
            if ch == end.chars().nth(i).unwrap() {
                i += 1;
                arg.push(ch);
                if i == correct_size_end {
                    countin = false;
                    i = 0;
                    for _ in 0..correct_size_end {
                        arg.remove(arg.len()-1);
                    }
                    temp.push_str(func(arg.clone()).as_str());
                    arg.clear();
                }
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