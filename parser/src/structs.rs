use serde_derive::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct Commands {
    pub text: String,
    pub col: Option<String>,
    pub br: bool,
    pub link: Option<String>,
    pub btn: Option<usize>,
    pub evt: Vec<i32>,
    pub cond: Option<String>,
    pub img: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Document {
    pub components: Vec<Component>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Component {
    pub num: usize,
    pub text: String,
    pub coms: Vec<Command>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Command {
    pub name: String,
    pub content: String,
}

impl Commands {
    pub fn new(text: String) -> Self {
        Commands {
            text,
            col: None,
            br: false,
            link: None,
            btn: None,
            evt: vec![],
            cond: None,
            img: None,
        }
    }

    pub fn col(&mut self, color: &str) -> &mut Self {
        self.col = Some(color.to_string());
        self
    }

    pub fn br(&mut self) -> &mut Self {
        self.br = true;
        self
    }

    pub fn link(&mut self, link: &str) -> &mut Self {
        self.link = Some(link.to_string());
        self
    }

    pub fn btn(&mut self, id: usize) -> &mut Self {
        self.btn = Some(id);
        self
    }

    pub fn evt(&mut self, id: Vec<i32>) -> &mut Self {
        self.evt.extend(id);
        self.evt.sort();
        self.evt.dedup();
        self
    }

    pub fn cond(&mut self, conditional: &str) -> &mut Self {
        self.cond = Some(conditional.to_string());
        self
    }

    pub fn img(&mut self, link: &str) -> &mut Self {
        self.img = Some(link.to_string());
        self
    }
}

impl Document {
    pub fn new() -> Self {
        let components = Vec::new();
        Document { components }
    }

    pub fn push(&mut self, commands: Commands, num: usize) {
        let mut coms = Vec::new();

        if !commands.evt.is_empty() {
            let evt_content = commands
                .evt
                .iter()
                .map(|x| x.to_string())
                .collect::<Vec<_>>()
                .join(",");
            coms.push(Command {
                name: "evt".to_string(),
                content: evt_content,
            });
        }
        if let Some(color) = &commands.col {
            coms.push(Command {
                name: "col".to_string(),
                content: color.to_string(),
            });
        }
        if commands.br {
            coms.push(Command {
                name: "br".to_string(),
                content: "".to_string(),
            });
        }
        if let Some(link) = &commands.link {
            coms.push(Command {
                name: "link".to_string(),
                content: link.to_string(),
            });
        }
        if let Some(id) = &commands.btn {
            coms.push(Command {
                name: "btn".to_string(),
                content: id.to_string(),
            });
        }
        if let Some(conditional) = &commands.cond {
            coms.push(Command {
                name: "cond".to_string(),
                content: conditional.to_string(),
            });
        }
        if let Some(link) = &commands.img {
            coms.push(Command {
                name: "img".to_string(),
                content: link.to_string(),
            });
        }

        let component = Component {
            num,
            text: commands.text,
            coms,
        };
        self.components.push(component);
    }
}
