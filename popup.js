document.addEventListener('DOMContentLoaded', function () {
    const snippetList = document.getElementById('snippet-list');
    const titleInput = document.getElementById('title');
    const contentInput = document.getElementById('content');
    const saveSnippetBtn = document.getElementById('save-snippet');
    const snippetFormTitle = document.getElementById('snippet-form-title');
    const snippetIndexInput = document.getElementById('snippet-index');

    let currentSnippets = [];

    // Load snippets from storage when the popup loads
    chrome.storage.local.get('snippets', function(data) {
        currentSnippets = data.snippets || [];
        currentSnippets.forEach((snippet, index) => addSnippetToUI(snippet, index));
    });

    // Save snippet button click handler
    saveSnippetBtn.addEventListener('click', function() {
        const title = titleInput.value.trim();
        const content = contentInput.value.trim();
        const snippetIndex = snippetIndexInput.value;

        if (title && content) {
            if (snippetIndex) {
                // Update an existing snippet
                currentSnippets[snippetIndex] = { title, content };
                chrome.storage.local.set({ snippets: currentSnippets }, function() {
                    updateSnippetInUI(snippetIndex, { title, content });
                    resetForm();
                });
            } else {
                // Add a new snippet
                const snippet = { title, content };
                currentSnippets.push(snippet);
                chrome.storage.local.set({ snippets: currentSnippets }, function() {
                    addSnippetToUI(snippet, currentSnippets.length - 1);
                    resetForm();
                });
            }
        }
    });

    // Function to add a snippet to the UI
    function addSnippetToUI(snippet, index) {
        const snippetItem = document.createElement('div');
        snippetItem.className = 'snippet-item';

        const snippetTitle = document.createElement('span');
        snippetTitle.textContent = snippet.title;
        snippetTitle.className = 'snippet-title';
        snippetTitle.addEventListener('click', () => {
            editSnippet(index);
        });

        const copyButton = document.createElement('button');
        copyButton.textContent = 'Copy';
        copyButton.addEventListener('click', function() {
            navigator.clipboard.writeText(snippet.content).then(() => {
                alert('Snippet copied to clipboard!');
            });
        });

        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.addEventListener('click', function() {
            editSnippet(index);
        });

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', function() {
            deleteSnippet(index);
        });

        snippetItem.appendChild(snippetTitle);
        snippetItem.appendChild(copyButton);
        snippetItem.appendChild(editButton);
        snippetItem.appendChild(deleteButton);
        snippetList.appendChild(snippetItem);
    }

    // Function to update a snippet in the UI
    function updateSnippetInUI(index, snippet) {
        const snippetItems = document.querySelectorAll('.snippet-item');
        const snippetItem = snippetItems[index];
        const snippetTitle = snippetItem.querySelector('.snippet-title');
        snippetTitle.textContent = snippet.title;
    }

    // Function to edit a snippet
    function editSnippet(index) {
        const snippet = currentSnippets[index];
        titleInput.value = snippet.title;
        contentInput.value = snippet.content;
        snippetIndexInput.value = index;
        snippetFormTitle.textContent = 'Edit Snippet';
        saveSnippetBtn.textContent = 'Update Snippet';
    }

    // Function to delete a snippet
    function deleteSnippet(index) {
        // Remove snippet from the array
        currentSnippets.splice(index, 1);
        // Update storage
        chrome.storage.local.set({ snippets: currentSnippets }, function() {
            // Remove the snippet from the UI
            refreshSnippetList();
            resetForm();
        });
    }

    // Function to refresh the snippet list UI
    function refreshSnippetList() {
        snippetList.innerHTML = ''; // Clear the current list
        currentSnippets.forEach((snippet, index) => addSnippetToUI(snippet, index));
    }

    // Function to reset the form after saving, updating, or deleting
    function resetForm() {
        titleInput.value = '';
        contentInput.value = '';
        snippetIndexInput.value = '';
        snippetFormTitle.textContent = 'Add New Snippet';
        saveSnippetBtn.textContent = 'Save Snippet';
    }
});
