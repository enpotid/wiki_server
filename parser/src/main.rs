use dotenv::dotenv;
//.env MUST CONTAIN
//IP1=127
//IP2=127
//IP3=127
//IP4=127
//PORT=24879
use std::env;
mod parse_namumark;
use serde::{Deserialize, Serialize};
use warp::Filter;
#[derive(Debug, Deserialize, Serialize)]
struct RequestData {
    contents: String,
    broken_links:Vec<bool>
}
// 파서 리뉴얼할꺼임
#[tokio::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();
    // POST 요청에서 contents를 받는 endpoint를 설정합니다.
    let post_route = warp::post()
        .and(warp::path("process"))
        .and(warp::body::json()) // JSON 형태로 데이터를 받음
        .map(|data: RequestData| {
            // 받은 contents를 처리하는 로직
            let contents = data.contents;
            let links = data.broken_links;
            let parsed = parse_namumark::parse(&format!("\n{}\n", &contents),links);
            warp::reply::json(&parsed)
        });

    // 서버 실행
    let addr: ([u8; 4], u16) = ([env::var("IP1").expect("IP1 환경변수가 비어있음").parse().expect("IP1이 U8이 아님"), env::var("IP2").expect("IP2 환경변수가 비어있음").parse().expect("IP2이 U8이 아님"), env::var("IP3").expect("IP3 환경변수가 비어있음").parse().expect("IP3이 U8이 아님"), env::var("IP4").expect("IP4 환경변수가 비어있음").parse().expect("IP4이 U8이 아님")], env::var("PORT").expect("PORT 환경변수가 비어있음").parse().expect("PORT이 U8이 아님"));
    warp::serve(post_route)
        .run(addr)
        .await;
    Ok(())
}