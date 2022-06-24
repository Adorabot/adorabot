

// url of cassandra server

extern crate scylla;
extern crate tokio;
extern crate serde_json;
extern crate serde;
use std::error::Error;
use scylla::{Session, SessionBuilder};
use std::io::Read;
use std::fs::File;
use serde_json::{Result, Value};
extern crate uuid;

use crate::scylla::IntoTypedRows;


use uuid::Uuid;

use serde::{Deserialize, Serialize};
// mandatory lines to use json in rust


fn main() {



let file = std::fs::File::open("../config.json")
    .expect("file should open read only");
let json: serde_json::Value = serde_json::from_reader(file)
    .expect("file should be proper JSON");
let first_name = json.get("config.cassandra.plainTextUsername")
    .expect("file should have FirstName key");

    print!("{}", first_name);

}