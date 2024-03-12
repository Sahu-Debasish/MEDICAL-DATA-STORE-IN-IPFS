// Array to store multiple entries
let entries = [];

// Function to generate and display QR code for the link
function generateQRCodeForLink(link) {
    const qrcodeContainer = document.getElementById("qrcodeContainer");

    // Clear previous QR code
    qrcodeContainer.innerHTML = '';

    // Use qrcode.js to generate QR code
    const qrcode = new QRCode(qrcodeContainer, {
        text: link,
        width: 128,
        height: 128,
    });
}

// Function to download the QR code with current date and time
function downloadQRCode() {
    const qrcodeContainer = document.getElementById("qrcodeContainer");

    // Create a temporary canvas element to convert QR code to an image
    const canvas = document.createElement("canvas");

    // Generate QR code on the temporary canvas
    const qrcode = new QRCode(canvas, {
        text: qrcodeContainer.firstChild.textContent,
        width: 128,
        height: 128,
    });

    // Convert canvas to data URL
    const dataURL = canvas.toDataURL("image/png");

    // Get the current date and time
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().replace(/[:.]/g, "-");

    // Create a temporary link element for downloading
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = `qrcode_${formattedDate}.png`;

    // Trigger a click on the link to initiate the download
    link.click();
}

// Function to open the "Create New" modal
function openCreateNewModal() {
    const createNewModal = document.getElementById("createNewModal");
    createNewModal.style.display = "block";
}

// Function to close the "Create New" modal
function closeCreateNewModal() {
    const createNewModal = document.getElementById("createNewModal");
    createNewModal.style.display = "none";
}

// Function to handle creating new entries
function createNewEntry() {
    // Get user input
    const newName = document.getElementById("name").value;
    const newDOB = document.getElementById("dob").value;
    const newDisease = document.getElementById("disease").value;
    const newEntryDate = document.getElementById("entryDate").value;

    // Validate input (you can add more validation as needed)

    // Create a new entry object
    const newEntry = {
        name: newName,
        dob: newDOB,
        disease: newDisease,
        entryDate: newEntryDate,
    };

    // Add the new entry to the array
    entries.push(newEntry);

    // For demonstration purposes, let's log the new entry to the console
    console.log("New Entry:", newEntry);

    // Close the modal after creating a new entry
    closeCreateNewModal();

    // Clear the input fields
    document.getElementById("name").value = "";
    document.getElementById("dob").value = "";
    document.getElementById("disease").value = "";
    document.getElementById("entryDate").value = "";
}

// Function to download data in CSV format
function downloadCSV() {
    // Prepare data in CSV format
    let csvContent = "Name,Date of Birth,Disease,Entry Date\n";

    // Iterate through entries and append to CSV content
    entries.forEach(entry => {
        csvContent += `${entry.name},${entry.dob},${entry.disease},${entry.entryDate}\n`;
    });

    // Create a Blob and initiate download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "entries.csv");
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Function to upload file to nft.storage
async function uploadFile() {
    const fileInput = document.getElementById("fileInput");
    const resultDiv = document.getElementById("result");
    const uploadingMessage = document.querySelector(".uploading-message");
    const qrcodeContainer = document.getElementById("qrcodeContainer");

    if (!fileInput.files.length) {
        resultDiv.textContent = "Please select a file.";
        return;
    }

    const file = fileInput.files[0];

    // Show the "Uploading..." message
    uploadingMessage.style.display = "block";

    // Create a FormData object
    const formData = new FormData();
    formData.append("file", file);

    try {
        // Upload the file to nft.storage
        const response = await fetch("https://api.nft.storage/upload", {
            method: "POST",
            headers: {
                Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDQ2NGIwODE2N0FkNWQxNDlDMjFiQmY2ZjA4ZjEyQ2E5RmFDODlBZjgiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTcwODQzOTQyMDk5MSwibmFtZSI6IkRFViJ9.IVi9dBTusMJ-IiyfhkKx3wA0EC7kYLfcX00m9I8HYiU",
            },
            body: formData,
        });

        const data = await response.json();

        if (response.ok) {
            // Display the CID (Content Identifier) and Filename of the uploaded file
            resultDiv.textContent = `File uploaded successfully! CID: ${data.value.cid}, Filename: ${file.name}`;

            // Generate and display QR code for the link
            const link = `https://cloudflare-ipfs.com/ipfs/${data.value.cid}/${encodeURIComponent(file.name)}`;
            generateQRCodeForLink(link);
        } else {
            // Handle the error
            resultDiv.textContent = `Error: ${data.error.message}`;
        }
    } catch (error) {
        console.error(error);
        resultDiv.textContent = "An error occurred while uploading the file.";
    } finally {
        // Hide the "Uploading..." message
        uploadingMessage.style.display = "none";
    }
}

// Function to copy link to clipboard
function copyLink() {
    const resultDiv = document.getElementById("result");

    // Get the text content (CID) and Filename from the resultDiv
    const cid = resultDiv.textContent.split(": ")[1].split(",")[0];
    const filename = resultDiv.textContent.split(": ")[2].trim();

    // Create a textarea element to copy the text to the clipboard
    const textarea = document.createElement("textarea");
    textarea.value = `https://cloudflare-ipfs.com/ipfs/${cid}/${encodeURIComponent(filename)}`;
    document.body.appendChild(textarea);

    // Select and copy the text
    textarea.select();
    document.execCommand("copy");

    // Remove the textarea from the DOM
    document.body.removeChild(textarea);

    alert("Link copied to clipboard!");
}

// Function to share link using Web Share API
async function shareLink() {
    const resultDiv = document.getElementById("result");
    const cid = resultDiv.textContent.split(": ")[1].split(",")[0];
    const filename = resultDiv.textContent.split(": ")[2].trim();
    
    const shareLink = `https://cloudflare-ipfs.com/ipfs/${cid}/${encodeURIComponent(filename)}`;

    try {
        // Check if Web Share API is available
        if (navigator.share) {
            await navigator.share({
                title: "IPFS File Link",
                text: "Check out this IPFS file link!",
                url: shareLink,
            });
        } else {
            // Fallback for browsers that do not support Web Share API
            alert("Web Share API is not supported on this browser.");
        }
    } catch (error) {
        console.error(error);
        alert("Error sharing the link.");
    }
}

// Example usage:
// Add event listeners to the buttons
document.getElementById("uploadButton").addEventListener("click", uploadFile);
document.getElementById("copyLinkButton").addEventListener("click", copyLink);
document.getElementById("shareLinkButton").addEventListener("click", shareLink);
document.getElementById("createNewButton").addEventListener("click", openCreateNewModal);
document.getElementById("submitNewEntryButton").addEventListener("click", createNewEntry);
document.getElementById("downloadQRCodeButton").addEventListener("click", downloadQRCode);
document.getElementById("downloadCSVButton").addEventListener("click", downloadCSV);
