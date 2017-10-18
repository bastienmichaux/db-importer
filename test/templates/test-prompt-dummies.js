// template choices, generated with dbi_book_author
const expectedColumnsSelectionChoices = [
    { type: 'separator', line: '\u001b[2mauthors\u001b[22m' },
    { name: 'id (int(11))', value: 'authors.id', checked: true },
    { name: 'name (varchar(255))', value: 'authors.name', checked: true },
    { name: 'birth_date (date)', value: 'authors.birth_date', checked: true },
    { type: 'separator', line: '\u001b[2mbooks\u001b[22m' },
    { name: 'id (int(11))', value: 'books.id', checked: true },
    { name: 'title (varchar(255))', value: 'books.title', checked: true },
    { name: 'price (bigint(20))', value: 'books.price', checked: true },
    { name: 'author (int(11))', value: 'books.author', checked: true }
];

module.exports = {
    expectedColumnsSelectionChoices
};
