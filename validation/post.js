const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validatePostInput(data) {
    let errors = {};


    data.text = !isEmpty(data.email) ? data.email : '';

    if(Validator.isLength(data.text, {min: 2, max: 200})){
        errors.text = 'Post must be between 2 and 200 characters';
    }

    if(Validator.isEmpty(data.text)){
        errors.text = 'Text field is required';
    }
    

    return {
        errors,
        isValid: isEmpty(errors)
    }
    
}