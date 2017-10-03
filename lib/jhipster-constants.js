/**
 * Java types/classes supported by Jhipster.
 * @todo: handle different Jhipster versions ?
 * @enum
 */
const jhipsterJavaTypes = {
    Boolean: 'Boolean',
    byte: 'byte[]', // for Blob/binary types, Jhipster JSON entities uses byte[] with an additional fields.fieldTypeBlobContent property
    Double: 'Double',
    Enumeration: 'Enumeration',
    Float: 'Float',
    Instant: 'Instant',
    Integer: 'Integer',
    LocalDate: 'LocalDate',
    Long: 'Long',
    String: 'String',
    ZonedDateTime: 'ZonedDateTime'
};

/**
 * Possible values for the fields.fieldTypeBlobContent property of a Jhipster JSON entity
 * When using the jhipster:entity generator, this property is added to any field declared as a Blob
 * @enum
 */
const jhipsterFieldTypeBlobContent = {
    any: 'any', // for other uses
    image: 'image', // for images
    text: 'text' // for text
};

module.exports = {
    jhipsterJavaTypes,
    jhipsterFieldTypeBlobContent,
};
