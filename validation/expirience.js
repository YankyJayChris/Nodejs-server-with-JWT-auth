const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validateexpirienceInput(data) {
    let errors = {};


    data.title = !isEmpty(data.title) ? data.title : '';
    data.company = !isEmpty(data.company) ? data.company : '';
    data.from = !isEmpty(data.from) ? data.from : '';
    
    if(!Validator.isEmpty(data.title)){
        errors.title = 'Title is required';
    }
    
    if(!Validator.isEmpty(data.company)){
        errors.company = 'company is required';
    }

    if(!Validator.isEmpty(data.from)){
        errors.from = 'from is required';
    }

    return {
        errors,
        isValid: isEmpty(errors)
    }
    
}