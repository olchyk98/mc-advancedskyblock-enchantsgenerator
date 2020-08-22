"use strict"; // :> Functional Programming Mode <:

const ENCHANTS_URL = `${window.location.origin}/enchants.json`;
const DOM_OBJ_REFS = {
    "ENCHANTS_SEARCH_INPUT": document.querySelector("#enchantments-searchinput"),
    "ENCHANTS_LABEL_OUTPUT_EXCLUDE": document.querySelector('.enchantslabel-output[name=exclude]'),
    "ENCHANTS_LABEL_OUTPUT_MATCH": document.querySelector('.enchantslabel-output[name=match]'),
    "ENCHANTS_CHECKBOXES_CONTAINER": document.querySelector("#container-enchants"),
}
const EGYPTIAN_NUMBERS = [
    "",
    "I",
    "II",
    "III",
    "IV",
    "V",
];

const ALL_NAMES = new Set();
const SELECTED_NAMES = new Set();

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
    const enchants = [];

    for (let enchant of responseJSON) {
        for (let ma = 1; ma <= enchant.maxLevel; ++ma) {
            // Generate name
            const name = `${enchant.name} ${EGYPTIAN_NUMBERS[ma]}`;

            // Add to ALL_NAMES
            ALL_NAMES.add(name);

            // Add to enchants
            enchants.push(name);
        }
    }

    // Return response
    return enchants;
}

function displayEnchantCheckboxes(enchants, filterName = "") {
    // References
    const container = DOM_OBJ_REFS["ENCHANTS_CHECKBOXES_CONTAINER"];
    const state = SELECTED_NAMES;

    // Clear the container content
    container.innerHTML = '';

    // Apply filter
    const filteredEnchants = (!filterName) ? enchants : (
        enchants.filter(name => {
            const nameLower = name.toLowerCase();
            const filterNameLower = filterName.toLowerCase();

            return (name.length > filterName.length) ?
                nameLower.includes(filterNameLower) :
                filterNameLower.includes(nameLower)

        })
    );

    // Add checkboxes
    for (let enchant of filteredEnchants) {
        // TODO VOLN DOC: Application vulnerable to HTML modifications.

        // Generate HTML
        const checkboxElementHTML = htmlGenerators["ENCHANT_CHECKBOX"](
            convertNameToNodeID(enchant), enchant
        );

        // Parse HTML
        const checkboxElement = htmlGenerators["__convertToNode"](checkboxElementHTML);

        // Add the click listener
        checkboxElement.addEventListener('change', e => {
            const isChecked = e.target.checked;

            // REFACTOR: Can be written in one line using ? operator [Dismissed]
            if (isChecked) {
                state.add(enchant);
            } else {
                state.delete(enchant);
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
    const match = [];
    let exclude = [...ALL_NAMES];

    let matchString, excludeString;

    if (SELECTED_NAMES.size > 0) {
        //
        for (let name of SELECTED_NAMES) {
            match.push(name);
            exclude = exclude.filter(io => io != name);
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

function enableSearch(enchants) {
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
    const enchants = await fetchEnchants(ENCHANTS_URL);

    // Push all enchants to the DOM
    displayEnchantCheckboxes(enchants);

    // Enable search
    enableSearch(enchants);
}

// Pipeline
(async () => await main())();