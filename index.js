import playerList from "./Input/Player-List.js"

async function fetchData(lcu) {
    let data = (await fetch(lcu)).json()
    return data
}

async function getPlayerMasteryScore(name, tagline) {
    let masteryScore = []
    let id = await (await fetchData(`/lol-summoner/v1/summoners?name=${name}%23${tagline}`))["accountId"]
    let champMasteryList = await (await fetchData(`/lol-collections/v1/inventories/${id}/champion-mastery`))
    let getLatestVersion = await (await fetchData("https://ddragon.leagueoflegends.com/api/versions.json"))[1]

    for (let i = 0; i < champMasteryList.length; i++) {

        let champsList = await (await fetchData(`https://ddragon.leagueoflegends.com/cdn/${getLatestVersion}/data/en_US/champion.json`))
        let champName

        for (let [key, value] of Object.entries(champsList["data"])) {
            if (champsList["data"][`${key}`]["key"] === `${champMasteryList[i]["championId"]}`){
                champName = champsList["data"][`${key}`]["name"]
            }
        }
        masteryScore.push({ 
            "championName": champName,
            "level": champMasteryList[i]["championLevel"],
            "points": champMasteryList[i]["championPoints"]
        })
    }

    return masteryScore
}

CommandBar.addAction({
    name: "Get player champions mastery points",
    legend: "",
    tags: ["Elaina"],
    group: "Elaina",
    hidden: false,
    perform: () => {
        let myTask = new Promise(async (resolve, reject) => {
            for (let i = 0; i < playerList.length; i++) {
                let playerName = playerList[i]["name"]
                let playerTag = playerList[i]["tagline"]
                let score = await getPlayerMasteryScore(playerName,playerTag)
                PluginFS.write(`./Output/${playerName}#${playerTag}.json`,JSON.stringify(score)).then( result => {
                    if(result) {}
                    else {
                        console.log("There's problem while extracting file")
                        reject()
                    }
                })
                console.log(score)
            }

            window.setTimeout(()=> {
                resolve()
            },1000)
        })
          
        Toast.promise(myTask, {
            loading: 'Working in progress...',
            success: 'Completed, you can open console log or Output folder for mastery points list',
            error: "There's problem while extracting file"
        })
    }
})