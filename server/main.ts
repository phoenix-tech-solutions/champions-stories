import express from "express";
import supabase from "./supabaseClient.ts";

const app = express();

app.post('/story', async (req, res) => {
    const { NAME, MESSAGE } = req.body.message;

    const { error } = await supabase
        .from('stories')
        .insert({ name: NAME, message: MESSAGE });

    if (error) {console.log(error)}
})

app.get("/story", async (req, res) => {

    const { data, error } = await supabase
        .from('stories')
        .select("*");
    
    res.send(data)
})

app.listen(8081)
