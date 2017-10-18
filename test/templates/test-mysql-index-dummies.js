const dummyQueryResults = [
    {
        table_name: 'authors',
        column_name: 'id',
        ordinal_position: 1,
        column_type: 'int(11)'
    }, {
        table_name: 'authors',
        column_name: 'name',
        ordinal_position: 2,
        column_type: 'varchar(255)'
    }, {
        table_name: 'authors',
        column_name: 'birth_date',
        ordinal_position: 3,
        column_type: 'date'
    }, {
        table_name: 'books',
        column_name: 'id',
        ordinal_position: 1,
        column_type: 'int(11)'
    }, {
        table_name: 'books',
        column_name: 'title',
        ordinal_position: 2,
        column_type: 'varchar(255)'
    }, {
        table_name: 'books',
        column_name: 'price',
        ordinal_position: 3,
        column_type: 'bigint(20)'
    }, {
        table_name: 'books',
        column_name: 'author',
        ordinal_position: 4,
        column_type: 'int(11)'
    }
];

const dummyEntities = {
    authors: {
        id: { ordinalPosition: 1, columnType: 'int(11)' },
        name: { ordinalPosition: 2, columnType: 'varchar(255)' },
        birth_date: { ordinalPosition: 3, columnType: 'date' }
    },
    books: {
        id: { ordinalPosition: 1, columnType: 'int(11)' },
        title: { ordinalPosition: 2, columnType: 'varchar(255)' },
        price: { ordinalPosition: 3, columnType: 'bigint(20)' },
        author: { ordinalPosition: 4, columnType: 'int(11)' }
    }
};

module.exports = {
    dummyEntities,
    dummyQueryResults
};
