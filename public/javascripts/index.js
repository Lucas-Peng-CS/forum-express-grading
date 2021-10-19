function validateValue (textBox) {
  const illegalString = "\`_~@#;,.!#$%^&*()+{}|\\:\"<>?-=/,\'"
  const textBoxValue = textBox.value
  const index = textBoxValue.length - 1
  const lastCharacter = textBoxValue.charAt(index)
  
  if(illegalString.indexOf(lastCharacter) >= 0) {
    textBox.value = textBoxValue.substring(0,index)
  }
}