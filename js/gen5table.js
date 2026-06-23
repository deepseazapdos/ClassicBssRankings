
export async function fetchData(rankingURL, sourceURL) {
    try {
        // API
        const rankingResponse = await fetch(rankingURL);
        const avatarResponse = await fetch("../../../api/gen5/pgl-avatars.json");
        const sourceResponse = await fetch(sourceURL);
        const regionResponse = await fetch("../../../api/gen5/regions.json")

        if (!rankingResponse.ok || !avatarResponse.ok || !sourceResponse.ok || !regionResponse.ok) {
            throw new Error(`HTTP error! Ranking status: ${rankingResponse.status} | PGL avatar status: ${avatarResponse.status} | Source status: ${sourceResponse.status} | Region status: ${regionResponse.status}`);
        }
        
        // JSON data
        const placements = await rankingResponse.json();
        const avatars = await avatarResponse.json();
        const sources = await sourceResponse.json();
        const regions = await regionResponse.json();
        
        // Target DOM element in HTML
        const rankingHtmlElement = document.getElementById("ranking");
        const sourceHtmlElement = document.getElementById("sources");
        
        // HTML for rankings
        let rankingHtmlContent = `
            <table>
                <caption></caption>
                <tr>
                    <th>Placement</th>
                    <th>PGL Avatar</th>
                    <th>Rating</th>
                    <th>PGL username</th>
                    <th>Region</th>
                    <th>IGN</th>
                    <th>Notes</th>
                    <th>Source(s)</th>
                </tr>`;

        // Build the ranking table
        placements.forEach(entry => {
            let currentAvatar = avatars.find(item => item.id === entry.pgl_data.pgl_avatar) ?? "";
            let avatarPath = "../../../img/pgl/avatar/" + currentAvatar.name + ".png";
            let currentRegion = regions.find(item => item.id === entry.pgl_data.region) ?? "";

            // Placement
            rankingHtmlContent += `
                <tr>
                    <td>#${entry.pgl_data.world_placement ?? "?"}</td>`;

            // Avatar
            if (currentAvatar === "") {
                rankingHtmlContent += "<td></td>";
            } else {
                rankingHtmlContent += `<td title='${currentAvatar.alt}'><img src='${avatarPath}' class='pglavatar' alt='${currentAvatar.alt} PGL Avatar'></td>`;
            }
            
            // Rating, PGL username
            rankingHtmlContent += `
                <td>${entry.pgl_data.rating ?? "?"}</td>
                    <td>${entry.pgl_data.pgl_username ?? ""}</td>`

            // Region
            if (currentRegion === "") {
                rankingHtmlContent += "<td></td>"
            } else {
                rankingHtmlContent += `<td title='${currentRegion.alt}'>${currentRegion.name ?? ""}</td>`
            }

            // IGN, Notes, Sources
            rankingHtmlContent += `
                <td>${entry.game_data.trainer_name ?? ""}</td>
                    <td>${entry.notes ?? ""}</td>
                    <td>${entry.sources ?? ""}</td>
                </tr>`;
        });

        rankingHtmlContent += "</table>";
        rankingHtmlElement.innerHTML = rankingHtmlContent;

        // HTML for sources
        let sourceHtmlContent = `<details>
                                    <summary>Click to toggle and view sources</summary>
                                    
                                    <ol>`

        // Build the source list
        sources.forEach(entry => {
            let currentSource = sources.find(item => item.id === entry.id);
            let currentSourceComment = currentSource.comment;
            let currentSourceLink = currentSource.source;

            sourceHtmlContent += `<li>${currentSourceComment}: <a href='${currentSourceLink}' target='_blank'>Link</a></li>`
        })

        sourceHtmlContent += "</ol></details>";
        sourceHtmlElement.innerHTML = sourceHtmlContent;

    } catch (error) {
        console.error("Failed to load API data:", error);
        document.getElementById("ranking").innerHTML = `
            <p style="color: red;">Error loading ranking data from the JSON file.</p>
        `;
        document.getElementById("sources").innerHTML = `
            <p style="color: red;">Error loading source data from the JSON file.</p>
        `;
    }
}

export async function fetchUsage(usageURL) {
    try {
        // API
        const usageResponse = await fetch(usageURL);

        if (!usageResponse.ok) {
            throw new Error(`HTTP error! Usage stats status: ${usageResponse.status}`);
        }
        
        // JSON data
        const usage_stats = await usageResponse.json();
        
        // Target DOM element in HTML
        const usageHtmlElement = document.getElementById("usage");
        const sourceHtmlElement = document.getElementById("sources");

        // HTML for usage stats
        let usageHtmlContent = `<div class='usagestatscontainer'>`;
        // For encapsulating top 2-5 and 6-10 into their grid areas
        // like this!
        // [1][2,  3,  4,  5 ]
        // [1][6, 7, 8, 9, 10]
        let gridAreaFlag = false;

        // Build the usage stats list
        usage_stats.forEach(entry => {
            let moves = [];
            let abilities = [];
            let natures = [];
            let items = [];

            entry.moves.names.forEach(cur => {
                //usageHtmlContent += `${cur}`;
                moves.push(cur);
            });

            if (entry.rank == 1) {
                // Open grid area
                usageHtmlContent += `<div class='usagestatsgrid-1'>`;
                //

                usageHtmlContent += `<div class='usagestatscard-1'>`;

                usageHtmlContent += `<h2 class='placementnumber'>${entry.rank ?? "?"}</h2>`;
                usageHtmlContent += `<img src='/img/dream/gen5/${entry.species}.png' alt='${entry.species} Dream World artwork' class='image-fade' onload="this.classList.add('loaded')">`
                usageHtmlContent += `<h3>${entry.species ?? ""}</h3></div>`;

                // Close grid area
                usageHtmlContent += `</div>`;
                //
            } else if (entry.rank >= 2 && entry.rank <= 5) {
                // Open grid area
                if (!gridAreaFlag) {
                    usageHtmlContent += `<div class='usagestatsgrid-25'>`;
                    gridAreaFlag = true;
                }
                //

                usageHtmlContent += `<div class='usagestatscard-25'>`;

                usageHtmlContent += `<h2 class='placementnumber'>${entry.rank ?? "?"}</h2>`;
                usageHtmlContent += `<img src='/img/dream/gen5/${entry.species}.png' alt='${entry.species} Dream World artwork' class='image-fade' onload="this.classList.add('loaded')"></div>`

                // Close grid area
                if (entry.rank == 5 && gridAreaFlag) {
                    usageHtmlContent += `</div>`;
                    gridAreaFlag = false;
                }
                //
            } else if (entry.rank >= 6 && entry.rank <= 10) {
                // Open Grid area
                if (!gridAreaFlag) {
                    usageHtmlContent += `<div class='usagestatsgrid-610'>`;
                    gridAreaFlag = true;
                }
                //

                usageHtmlContent += `<div class='usagestatscard-610'>`;

                usageHtmlContent += `<h2 class='placementnumber'>${entry.rank ?? "?"}</h2>`;
                usageHtmlContent += `<img src='/img/dream/gen5/${entry.species}.png' alt='${entry.species} Dream World artwork' class='image-fade' onload="this.classList.add('loaded')"></div>`
                
                // Close grid area
                if (entry.rank == 10 && gridAreaFlag) {
                    usageHtmlContent += `</div>`;
                    gridAreaFlag = false;
                }
                //
            }
        })

        usageHtmlContent += "</div></table>";
        usageHtmlElement.innerHTML = usageHtmlContent;

    } catch (error) {
        console.error("Failed to load API data:", error);
        document.getElementById("ranking").innerHTML = `
            <p style="color: red;">Error loading usage stats data from the JSON file.</p>
        `;
        document.getElementById("sources").innerHTML = `
            <p style="color: red;">Error loading source data from the JSON file.</p>
        `;
    }
}

export async function fetchUsageDateList(usageURL, season) {
    try {
        // API
        const usageDateList = await fetch(usageURL);

        if (!usageDateList.ok) {
            throw new Error(`HTTP error! Usage stats date list status: ${usageDateList.status}`);
        }
        
        // JSON data
        const usage_datelist = await usageDateList.json();
        
        // Target DOM element in HTML
        const usageDateListHtmlElement = document.getElementById("archived-dates");
        const sourceHtmlElement = document.getElementById("sources");

        // HTML for usage stats
        let usageDateListHtmlContent = `<label for="date-select">Archived dates</label>
                                        <select name="dates" id="date-select">
                                        <option value='no-selection' selected disabled>-</option>`;

        // HTML for sources
        let sourceHtmlContent = `<details>
                                    <summary>Click to toggle and view sources</summary>
                                    
                                    <ol>`

        // Build the date selection list
        usage_datelist.forEach(entry => {
            let day = entry.date.slice(0, 2);
            let month = entry.date.slice(2, 4);
            let year = entry.date.slice(4, 8);
            let ddmmyyyyString = day + "-" + month + "-" + year;
            let currentSourceComment = entry.comment;
            let currentSourceLink = entry.source;

            usageDateListHtmlContent += `<option value='${entry.date}'>${ddmmyyyyString}</option>`;
            sourceHtmlContent += `<li>${ddmmyyyyString} - ${currentSourceComment}: <a href='${currentSourceLink}' target='_blank'>Link</a></li>`
        });

        usageDateListHtmlContent += `</select>`;
        usageDateListHtmlElement.innerHTML = usageDateListHtmlContent;

        sourceHtmlContent += "</ol></details>";
        sourceHtmlElement.innerHTML = sourceHtmlContent;

        // Date selection element
        const selectElement = document.getElementById('date-select');

        // Function for date selection
        function selectDate(event) {
            fetchUsage('../../../api/gen5/b2w2/s' + season + '-' + event.target.value + '-usage.json');
        }

        // Event listener for date selection
        selectElement.addEventListener('change', selectDate);

    } catch (error) {
        console.error("Failed to load API data:", error);
        document.getElementById("ranking").innerHTML = `
            <p style="color: red;">Error loading usage stats data from the JSON file.</p>
        `;
        document.getElementById("sources").innerHTML = `
            <p style="color: red;">Error loading source data from the JSON file.</p>
        `;
    }
}
