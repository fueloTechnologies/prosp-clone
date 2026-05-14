export function replaceVariables(
  text: string,
  contact: any
) {

  if (!text) return text

  let result = text

  result =
    result.replace(
      /{{firstName}}/g,
      contact?.firstName || ''
    )

  result =
    result.replace(
      /{{lastName}}/g,
      contact?.lastName || ''
    )

  result =
    result.replace(
      /{{company}}/g,
      contact?.company || ''
    )

  result =
    result.replace(
      /{{position}}/g,
      contact?.position || ''
    )

  return result

}