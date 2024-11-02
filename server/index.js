const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
app.use(express.json());
app.use(cors());

// Function to generate wordlist with advanced combinations
function generateWordlist(data) {
    const {
        name,
        birthyear,
        mobile,
        keywords = [],
        specialChars = ["!", "@", "#", "$", "%", "&", "*"],
        maxCombinations = 1000000,
        minLength = 6,
        maxLength = 12,
        includeCaps = true,
        includeNumbers = true,
        includeSpecialChars = true
    } = data;

    let words = new Set();

    // Helper function for leetspeak substitutions
    function leetSpeak(word) {
        const replacements = { 'a': '@', 's': '$', 'i': '1', 'e': '3', 'o': '0' };
        let leetWords = [word];
        
        for (const [char, substitute] of Object.entries(replacements)) {
            let newWords = [];
            leetWords.forEach(w => {
                if (w.includes(char)) {
                    newWords.push(w.replaceAll(char, substitute));
                }
            });
            leetWords.push(...newWords);
        }
        return leetWords;
    }

    // Generate variations with name, keywords, birth year, and mobile number
    const nameVariations = [
        name.toLowerCase(),
        name.toUpperCase(),
        ...leetSpeak(name.toLowerCase())
    ].filter(Boolean);

    const yearSegments = [
        birthyear,
        birthyear.slice(-2),
        birthyear.split("").reverse().join("")
    ];

    const mobileSegments = [
        mobile.slice(-4),
        mobile.slice(-2),
        mobile,
        mobile.split("").reverse().join("")
    ];

    // Generate combinations with keywords, year, and mobile segments
    nameVariations.forEach(n => {
        keywords.forEach(keyword => {
            [n, ...leetSpeak(n)].forEach(variant => {
                words.add(`${variant}${keyword}`);
                words.add(`${keyword}${variant}`);
            });
        });
    });

    // Add number combinations and mix in special characters
    nameVariations.forEach(n => {
        yearSegments.forEach(y => {
            mobileSegments.forEach(m => {
                words.add(`${n}${y}${m}`);
                words.add(`${y}${m}${n}`);
                words.add(`${m}${n}${y}`);

                if (includeSpecialChars) {
                    specialChars.forEach(char => {
                        words.add(`${char}${n}${y}`);
                        words.add(`${n}${y}${char}`);
                        words.add(`${n}${m}${char}`);
                        words.add(`${char}${y}${m}`);
                    });
                }
            });
        });
    });

    // Adding more patterns with all combinations of leetspeak and special characters
    if (includeSpecialChars) {
        nameVariations.forEach(n => {
            specialChars.forEach(char => {
                keywords.forEach(keyword => {
                    words.add(`${char}${n}${keyword}`);
                    words.add(`${n}${char}${keyword}`);
                    yearSegments.forEach(y => {
                        words.add(`${n}${keyword}${y}${char}`);
                        words.add(`${char}${y}${keyword}${n}`);
                    });
                });
            });
        });
    }

    // Include numbers in combinations
    if (includeNumbers) {
        const numbers = Array.from({ length: 10 }, (_, i) => i.toString());
        nameVariations.forEach(n => {
            numbers.forEach(num => {
                words.add(`${n}${num}`);
                words.add(`${num}${n}`);
            });
        });
    }

    // Generate more complex patterns
    nameVariations.forEach(n => {
        const variations = [
            `${n}@`, `${n}!`, `${n}#`, `${n}$`, 
            `@${n}`, `!${n}`, `#${n}`, `$${n}`
        ];
        variations.forEach(variant => {
            words.add(variant);
            words.add(variant + "123");
            words.add(variant + "2024");
        });
    });

    // Filter by length and limit the wordlist size
    const filteredWords = Array.from(words).filter(word => word.length >= minLength && word.length <= maxLength);

    // Ensure wordlist does not exceed maxCombinations
    const finalWords = filteredWords.slice(0, maxCombinations);
    const filename = "large_wordlist.txt";
    fs.writeFileSync(filename, finalWords.join("\n"));
    return filename;
}

// API endpoint to generate and download wordlist
app.post("/api/generate", (req, res) => {
    try {
        const filename = generateWordlist(req.body);
        res.download(filename, (err) => {
            if (err) {
                console.error("Error in file download:", err);
                res.status(500).send("Error generating wordlist");
            }
            fs.unlinkSync(filename); // Clean up file after download
        });
    } catch (error) {
        console.error("Error generating wordlist:", error);
        res.status(500).send("Error generating wordlist");
    }
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
