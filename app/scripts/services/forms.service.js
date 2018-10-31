'use strict';

/**
 * Form validation service
**/

class FormService {
  constructor() {
    this.rules = {
      minLength: 1,
      maxLength: 25,
      re: RegExp(/^[\w ,]+$/)
    };
  }
  /**
   *
  **/
  validate(formData, rules = this.rules) {
    console.log(formData);
    const fieldType = Object.keys(formData)[0];
    const input = formData[fieldType];
    console.log(input);
    let error = '';
    if (input.length < rules.minLength) {
      error += `${fieldType.toUpperCase()} length is too short, minimum length is ${rules.minLength}\n`;
    }
    if (input.length > rules.maxLength) {
      error += `${fieldType.toUpperCase()} length is too long, maximum length is ${rules.maxLength}\n`;
    }
    if (!rules.re.test(input)) {
      error += `${fieldType.toUpperCase()} contains invalid characters`;
    }
    return {error: error};
  }
}
