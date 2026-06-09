
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
