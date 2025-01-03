import fs from 'fs';

// Function to read the file and extract course information using regex
const extractCourses = async () => {
    // Read the scraped content from the file
    const content = fs.readFileSync('scrapedContent.txt', 'utf-8');

    // Define a regex pattern to extract course codes and titles
    const courseRegex = /<a href="\/undergraduate(.*?)".*?>(COMP[0-9]{4}) (.*?)<\/span>/g;

    // Store matches in an array
    const courses = [];
    let match;

    // Loop through all matches
    while ((match = courseRegex.exec(content)) !== null) {
        const courseLink = `/undergraduate${match[1]}`; // Full link to the course
        const courseCode = match[2]; // Course code (e.g., COMP1234)
        const courseTitle = match[3]; // Course title

        // Push the extracted data into the courses array
        courses.push({ courseLink, courseCode, courseTitle });
    }

    // Write the extracted courses to a JSON file
    fs.writeFileSync('courses.json', JSON.stringify(courses, null, 2), 'utf-8');

    // Log confirmation
    console.log('Extracted courses have been saved to courses.json');
    console.log('Number of courses:', courses.length);
};

extractCourses();
