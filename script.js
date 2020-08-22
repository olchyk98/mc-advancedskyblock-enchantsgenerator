"use strict"; // :> Functional Programming Mode <:

const ENCHANTS_URL = `${ window.location.origin }/enchants.json`;

// TODO: Implement search
const htmlGenerators = {
    "ENCHANT_CHECKBOX": (checkboxID, name) =>
    (
        `<label><input id=${ checkboxID } type="checkbox">
        ${ name }</label>`
    ),
}

function castFetchError(details = null)
{
    alert("An error occured while loading. Restart the page!");
    throw new Error(`FetchError; Details: ${ details || "none" }`);
}

async function fetchEnchants(targetURL = ENCHANTS_URL)
{
    // Request
    const enchants = await fetch(targetURL);

    // Check if got a response
    if(!enchants.ok) return castFetchError();

    // Extract the json
    let responseJSON = null;
    try
    {
        responseJSON = await enchants.json();
    } catch(_)
    {
        castFetchError("Error during the JSON parsing process");
    }

    // Return if success
    return responseJSON;
}

function generateEnchantCheckboxes()
{
    
}

//
async function main()
{
    // Fetch the enchants file
    const enchants = await fetchEnchants(ENCHANTS_URL);

    // Fill the document
    generateEnchantCheckboxes();
}

// Pipeline
(async () => await main())();