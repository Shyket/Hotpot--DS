const csv = require("csvtojson");
const fs = require("fs");
const Tokenizer = require("sentence-tokenizer");

const csvFilePath = "./CSVs/146.csv";

function parseJSON(filePath) {
    return csv()
        .fromFile(filePath)
        .then((json) => {
            processJSON(json);
        });
}

function convertToSartazFormat(json) {
    return json.map((row) => {
        questions = getArrayFromStringList(row["Question"]);
        questionIDs = getArrayFromStringList(row["Question ID"]);
        questionTypes = getArrayFromStringList(row["Question Type"]);
        answers = getArrayFromStringList(row["Answer"]);
        titles = getArrayFromStringList(row["Title"]);
        MainPassageFacts = getArrayFromStringList(
            row["Main Passage Sentence Numbers"]
        );
        LinkPassageFacts = getArrayFromStringList(
            row["Link Passage Sentence Numbers"]
        );

        // let formattedJSON = {
        //     passage_id: row["Main Passage ID"],
        //     title: row["Title"],
        //     context: [
        //         senitizeContext(row["Main Passage"]),
        //         senitizeContext(row["Link Passage"]),
        //     ],
        //     qas: [],
        // };

        qaPairs = [];

        for (let i = 0; i < questions.length; i++) {
            let formattedJSON = {
                id: "",
                question: "",
                answer: "",
                type: "",
                level: "",
                supporting_facts: { title: [], sent_id: [] },
                context: { title: [], sentences: [] },
            };
            formattedJSON.id = questionIDs[i];
            formattedJSON.question = questions[i];
            formattedJSON.answer = answers[i];
            formattedJSON.type = questionTypes[i];
            formattedJSON.level = "medium";
            formattedJSON.supporting_facts.title = titles;
            formattedJSON.supporting_facts.sent_id = [
                Number(MainPassageFacts[i]) - 1,
                Number(LinkPassageFacts[i]) - 1,
            ];
            formattedJSON.context.title = titles;
            formattedJSON.context.sentences = [
                senitizeContext(row["Main Passage"]),
                senitizeContext(row["Link Passage"]),
            ];
            qaPairs.push(formattedJSON);
            // formattedJSON.qas.push({
            //     question_id: questionIDs[i],
            //     question_text: questions[i],
            //     question_type: questionTypes[i],
            //     answers: { answer_text: answers[i], answer_type: "" },
            //     is_answerable: "1",
            // });
        }
        // console.log(qaPairs);
        return qaPairs;
    });
}

function senitizeContext(context) {
    let txt = context.replace(/[\n\r\d]/g, "");
    const sentences = txt.match(/([^\n।?!]+[।?!]+)/g);
    console.log(sentences);

    return sentences;

}

function getArrayFromStringList(stringList) {
    return stringList
        .split(/\d+\)/g)
        .map((item) => item.trim())
        .filter((item) => item !== "");
}

async function saveToFile(json) {
    fs.writeFile("./outputs/146.json", JSON.stringify(json), (err) => {
        if (err) throw err;
    });
}

function processJSON(json) {
    let formattedJSON = convertToSartazFormat(json);
    let finalJSON = [];
    for (i = 0; i < formattedJSON.length; i++) {
        finalJSON = [...finalJSON, ...formattedJSON[i]];
    }

    console.log(finalJSON);
    saveToFile(finalJSON);
}

parseJSON(csvFilePath);
