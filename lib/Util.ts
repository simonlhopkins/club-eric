export default class Util {
  static getMonthName(monthNumber: number): string {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    if (monthNumber < 1 || monthNumber > 12) {
      throw new Error("Invalid month number. Must be between 1 and 12.");
    }

    return monthNames[monthNumber - 1];
  }
  static logObject(obj: any) {
    console.log(JSON.stringify(obj));
  }
}
