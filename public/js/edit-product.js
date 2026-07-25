function removeField(button){

    button.parentElement.remove();

}

// IMAGE

function addImageField(){

    const container =
        document.getElementById(
            "image-container"
        );

    const div =
        document.createElement("div");

    div.classList.add("image-box");

    div.innerHTML = `

        <input
            type="text"
            name="images"
            placeholder="Image URL"
        />

        <button
            type="button"
            class="remove-btn"
            onclick="removeField(this)"
        >
            Remove
        </button>

    `;

    container.appendChild(div);

}

// VIDEO

function addVideoField(){

    const container =
        document.getElementById(
            "video-container"
        );

    const div =
        document.createElement("div");

    div.classList.add("video-box");

    div.innerHTML = `

        <input
            type="text"
            name="videos"
            placeholder="Video URL"
        />

        <button
            type="button"
            class="remove-btn"
            onclick="removeField(this)"
        >
            Remove
        </button>

    `;

    container.appendChild(div);

}

// CUSTOMIZATION

function addCustomizationField(){

    const container =
        document.getElementById(
            "customization-container"
        );

    const div =
        document.createElement("div");

    div.classList.add(
        "customization-box"
    );

    div.innerHTML = `

        <!-- NAME -->
        <input
            type="text"
            name="customizationFields[${fieldIndex}][name]"
            placeholder="Field Name"
        />

        <!-- LABEL -->
        <input
            type="text"
            name="customizationFields[${fieldIndex}][label]"
            placeholder="Field Label"
        />

        <!-- TYPE -->
        <select
            name="customizationFields[${fieldIndex}][type]"
        >
            <option value="text">Text</option>
            <option value="number">Number</option>
            <option value="select">Select</option>
        </select>

        <!-- OPTIONS -->
        <input
            type="text"
            name="customizationFields[${fieldIndex}][options]"
            placeholder="Options (comma separated)"
        />

        <!-- PLACEHOLDER -->
        <input
            type="text"
            name="customizationFields[${fieldIndex}][placeholder]"
            placeholder="Placeholder"
        />

        <!-- DEPENDS ON -->
        <input
            type="text"
            name="customizationFields[${fieldIndex}][dependsOn][field]"
            placeholder="Depends On Field"
        />

        <input
            type="text"
            name="customizationFields[${fieldIndex}][dependsOn][value]"
            placeholder="Depends On Value"
        />

        <!-- REQUIRED -->
        <label>
            Required
            <input
                type="checkbox"
                name="customizationFields[${fieldIndex}][required]"
            />
        </label>

        <br><br>

        <button
            type="button"
            class="remove-btn"
            onclick="removeField(this)"
        >
            Remove Field
        </button>

    `;

    container.appendChild(div);

    fieldIndex++;

}