"use strict"; // :> Functional Programming Mode <:

const ENCHANTS_URL = `${window.location.origin}/enchants.json`;
const DOM_OBJ_REFS = {
    "ENCHANTS_SEARCH_INPUT": document.querySelector("#enchantments-searchinput"),
    "ENCHANTS_LABEL_OUTPUT_EXCLUDE": document.querySelector('.enchantslabel-output[name=exclude]'),
    "ENCHANTS_LABEL_OUTPUT_MATCH": document.querySelector('.enchantslabel-output[name=match]'),
    "ENCHANTS_CHECKBOXES_CONTAINER": document.querySelector("#container-enchants"),
}
const EGYPTIAN_NUMBERS = [
    "nfr",
    "I",
    "II",
    "III",
    "IV",
    "V",
];

const ALL_ENCHANTS = [];
let SELECTED_ENCHANTS = [];

// TODO: Implement search
const htmlGenerators = {
    "ENCHANT_CHECKBOX": (checkboxID, name) =>
        (
            `<label><input id=${checkboxID} type="checkbox">${name}</label>`
        ),
    "__convertToNode": (html) => {
        // Prepare container
        const constructorContainer = document.createElement('div');

        // Push the HTML
        constructorContainer.innerHTML = html;

        // Get and return the node
        const parsedElement = constructorContainer.firstChild;
        return parsedElement;
    }
}

function convertNameToNodeID(name) {
    return name.replace(/\s|\n/g, "_");
}

function castFetchError(details = null) {
    alert("An error occured while loading. Restart the page!");
    throw new Error(`FetchError; Details: ${details || "none"}`);
}

// REFACTOR: Fix Methods SRP problem
async function fetchEnchants(targetURL = ENCHANTS_URL) {
    // Request
    const response = await fetch(targetURL);

    // Check if got a response
    if (!response.ok) return castFetchError();

    // Extract the json
    let responseJSON = null;
    try {
        responseJSON = await response.json();
    } catch (_) {
        castFetchError("Error during the JSON parsing process");
    }

    // Add enchs levels
    for (let enchant of responseJSON) {
        for (let ma = 1; ma <= enchant.maxLevel; ++ma) {
            // Generate name
            const fullName = `${enchant.name} ${EGYPTIAN_NUMBERS[ma]}`;

            // Add to ALL_ENCHANTS
            ALL_ENCHANTS.push({
                ...enchant,
                enchantName: enchant.name,
                name: fullName,
            });
        }
    }
}

function displayEnchantCheckboxes(enchants = ALL_ENCHANTS, filterName = "") {
    // References
    const container = DOM_OBJ_REFS["ENCHANTS_CHECKBOXES_CONTAINER"];

    // Clear the container content
    container.innerHTML = '';

    // Apply filter
    const filteredEnchants = (!filterName) ? enchants : (
        enchants.filter(item => {
            const nameLower = item.name.toLowerCase();
            const filterNameLower = filterName.toLowerCase();

            return (item.name.length > filterName.length) ?
                nameLower.includes(filterNameLower) :
                filterNameLower.includes(nameLower)

        })
    );

    // Add checkboxes
    for (let enchant of filteredEnchants) {
        // TODO VOLN DOC: Application vulnerable to HTML modifications.

        // Generate HTML
        const checkboxElementHTML = htmlGenerators["ENCHANT_CHECKBOX"](
            convertNameToNodeID(enchant.name), enchant.name
        );

        // Parse HTML
        const checkboxElement = htmlGenerators["__convertToNode"](checkboxElementHTML);

        // Link state
        checkboxElement.querySelector("input").checked = SELECTED_ENCHANTS.includes(enchant);

        // Add the click listener
        checkboxElement.addEventListener('change', e => {
            const isChecked = e.target.checked;

            // REFACTOR: Can be written in one line using ? operator [Dismissed]
            if (isChecked) {
                SELECTED_ENCHANTS.push(enchant);
            } else {
                SELECTED_ENCHANTS = SELECTED_ENCHANTS.filter(io => io.name != enchant.name);
            }

            // Update the dom
            displayEnchantLabels();
        });

        // Push to the DOM
        container.appendChild(checkboxElement);
    }
}

function displayEnchantLabels() {
    //
    let matchString, excludeString;
    const match = [];

    // Unique exclude
    let excludeSeen = [];
    let exclude = [...ALL_ENCHANTS].map(io => io.enchantName).filter(io => {
        if(excludeSeen.includes(io)) return false;
        return excludeSeen.push(io), true;
    });

    //

    if (SELECTED_ENCHANTS.length > 0) {
        //
        for (let item of SELECTED_ENCHANTS) {
            // Add to the matches
            match.push(item.name);

            // Remove from the excluded
            exclude = exclude.filter(io => io != item.enchantName);
        }

        //
        matchString = match.join(", ");
        excludeString = exclude.join(", ");
    } else {
        matchString = excludeString = "NONE";
    }

    //
    DOM_OBJ_REFS["ENCHANTS_LABEL_OUTPUT_MATCH"].textContent = matchString;
    DOM_OBJ_REFS["ENCHANTS_LABEL_OUTPUT_EXCLUDE"].textContent = excludeString;
}

function enableSearch(enchants = ALL_ENCHANTS) {
    // Get input ref
    const target = DOM_OBJ_REFS["ENCHANTS_SEARCH_INPUT"];

    // Set enable attribute
    target.removeAttribute('disabled');

    // Add event listener
    target.addEventListener('input', e => {
        displayEnchantCheckboxes(enchants, e.target.value);
    });
}

//
async function main() {
    // Fetch the enchants file
    await fetchEnchants(ENCHANTS_URL); // -> ALL_ENCHANTS

    // Push all enchants to the DOM
    displayEnchantCheckboxes(ALL_ENCHANTS);

    // Enable search
    enableSearch(ALL_ENCHANTS);
}

// Pipeline
(async () => await main())();