<script>
    let username = "";
    let password = "";

    // Entities
    let user = $state(null);
    let articles = $state([]);
    let selectedArticle = $state(null); // New state for the selected article

    // State
    const isLoggedIn = $state(false);
    const isLoading = $state(false);
    let error = $state(null);

    async function fetchArticles() {
        const response = await fetch("http://localhost:3000/articles", {
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + user.token,
            },
        });

        const json = await response.json();

        if (!response.ok) {
            error = text;
            return;
        }

        error = null;
        articles = json;
    }

    async function fetchSingleArticle(id) {
        const response = await fetch("http://localhost:3000/articles/" + id, {
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + user.token,
            },
        });

        const json = await response.json();

        if (!response.ok) {
            error = text;
            return;
        }

        error = null;
    }

    async function handleLogin(event) {
        // Handle login event
        const response = await fetch("http://localhost:3000/login", {
            method: "POST",
            body: JSON.stringify({ username, password }),
            headers: { "Content-Type": "application/json" },
        });

        const text = await response.json();

        if (!response.ok) {
            error = text;
            return;
        }

        error = null;
        user = { token: text.token, username, role: text.role };

        fetchArticles();
    }

    async function handleLogout() {
        username = "";
        password = "";
        user = null;
        articles = [];
    }

    function getPaidClass(article) {
        if (article.paid) {
            return "paid";
        }

        return "free";
    }

    async function openArticleModal(article) {
        await fetchSingleArticle(article.id);
        selectedArticle = article; // Set the selected article
    }

    async function closeArticleModal() {
        selectedArticle = null; // Clear the selected article
    }
</script>

<!-- LOGIN PAGE -->
<div class="body">
    {#if !user}
        <div class="login-container">
            <h2>Login Form</h2>
            <form onsubmit={handleLogin}>
                <input
                    type="text"
                    placeholder="Username"
                    bind:value={username}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    bind:value={password}
                    required
                />
                <button type="submit">Log In</button>
            </form>
            <br />
            <div class="error">{error}</div>
        </div>
    {/if}
    {#if user}
        <!-- LOGOUT -->
        <button type="submit" onclick={handleLogout}>Log Out</button>
        <br />

        {#if user?.role === 'Admin'}
            <button onclick={() => window.location.href = '/admin'}>Go to Admin Page</button>
        {/if}

        <!-- Articles Section -->
        <div>
            <h1>The articles !</h1>
            <div>
                <hr />
                {#each articles as article}
                    <div
                        class={getPaidClass(article)}
                        onclick={() => openArticleModal(article)}
                    >
                        <h3>
                            {article.subject}
                        </h3>
                        <p>
                            {article.content.substring(0, 100)}...
                        </p>
                    </div>
                    <hr />
                {/each}
            </div>
        </div>
    {/if}

    <!-- Modal for full article -->
    {#if selectedArticle}
        <div class="modal-overlay" onclick={() => closeArticleModal()}>
            <div class="modal">
                <h2>{selectedArticle.subject}</h2>
                <p>{selectedArticle.content}</p>
                <button onclick={() => closeArticleModal()}>Close</button>
            </div>
        </div>
    {/if}
</div>

<style>
    @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap");

    :global(body) {
        font-family: "Inter", sans-serif;
        background-color: #f9fafb; /* Light gray background */
        color: #333; /* Dark text for readability */
        margin: 0;
        padding: 0;
    }

    .body {
        padding: 20px;
    }

    .free {
        background-color: #e0f7fa; /* Light cyan */
        border: 1px solid #00acc1; /* Cyan border */
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 10px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        cursor: pointer;
    }

    .paid {
        background-color: #fff3e0; /* Light orange */
        border: 1px solid #fb8c00; /* Orange border */
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 10px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        cursor: pointer;
    }

    .login-container {
        max-width: 400px;
        margin: auto;
        padding: 20px;
        border: 1px solid #ddd;
        border-radius: 8px;
        background-color: #ffffff;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    input {
        width: calc(100% - 22px);
        padding: 10px;
        margin-bottom: 15px;
        border: 1px solid #ccc;
        border-radius: 4px;
        box-sizing: border-box;
        outline: none;
        transition: border-color 0.2s;
    }

    input:focus {
        border-color: #00acc1; /* Cyan focus */
    }

    .login-container button {
        width: 100%;
        padding: 10px;
        background-color: #00acc1; /* Cyan button */
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 600;
        transition: background-color 0.2s;
    }

    .login-container button:hover {
        background-color: #007c91; /* Darker cyan */
    }

    .error {
        color: #e53935; /* Red for errors */
        font-weight: bold;
    }

    h1,
    h2,
    h3 {
        color: #333;
    }

    hr {
        border: none;
        border-top: 1px solid #ddd;
        margin: 20px 0;
    }

    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.6); /* Slightly darker overlay */
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }

    .modal {
        background-color: white;
        padding: 30px; /* Increased padding for better spacing */
        border-radius: 12px; /* Softer border radius */
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2); /* Stronger shadow for depth */
        max-width: 800px; /* Limit modal width */
        width: 90%; /* Responsive width */
        max-height: 80%; /* Limit modal height */
        overflow-y: auto; /* Scrollable content */
        font-family: "Inter", sans-serif; /* Consistent font */
    }

    .modal h2 {
        font-size: 1.8rem; /* Larger title font */
        margin-bottom: 20px; /* Add spacing below the title */
        color: #333; /* Darker title color */
    }

    .modal p {
        font-size: 1rem; /* Comfortable font size for reading */
        line-height: 1.6; /* Increased line height for readability */
        color: #555; /* Softer text color */
        margin-bottom: 20px; /* Add spacing between paragraphs */
    }

    .modal button {
        margin-top: 20px;
        padding: 12px 20px; /* Larger button for better usability */
        background-color: #00acc1; /* Cyan button */
        color: white;
        border: none;
        border-radius: 6px; /* Softer button corners */
        cursor: pointer;
        font-weight: 600;
        font-size: 1rem; /* Slightly larger font */
        transition: background-color 0.2s;
    }

    .modal button:hover {
        background-color: #007c91; /* Darker cyan */
    }

    /* Add smooth scrolling for long content */
    .modal::-webkit-scrollbar {
        width: 8px;
    }

    .modal::-webkit-scrollbar-thumb {
        background-color: #ccc;
        border-radius: 4px;
    }

    .modal::-webkit-scrollbar-thumb:hover {
        background-color: #aaa;
    }
</style>
