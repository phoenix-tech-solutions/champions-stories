import express from "express";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient('https://txsrwrrbnlbjmjcrbevh.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4c3J3cnJibmxiam1qY3JiZXZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxNDA1ODQsImV4cCI6MjA1NzcxNjU4NH0.mWoQRHJDPYkXwnDRm2IAR199ebYtD5P4sb37QOzgJG8');

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
