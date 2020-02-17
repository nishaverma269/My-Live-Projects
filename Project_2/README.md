A project where I have done a FrontEnd work to design an admin page for adding, updating, and deleting checks.

Features:

1. Get Quality Stations from Database and return routines based on the selected station.
2. User should also have the ability to add, update, and delete routine anytime.
3. Based on a selected routine, user should see the frequencies and orders associated with that routine.
4. If needed user can add or remove frequencies from the filter list and as they add or remove order checks will also get updated respectively.
5. User have the ability to drag and reorder the checks and the order number gets updated accordingly.
6. If user removes a frequency, order will also get removed and it'll be clearly visible to the user. Same while adding or updating.
7. After done, user can save the routine and save function has the validation factors. Such as:
	* User cannot add a routine without a name or a name with whitespace characters
	* Frequencies with similar checks cannot be saved. User needs to select one or the other and modal is used to alert the user.
	* Duplicate Routine name cannot be used.
	* User cannot add a routine without frequency.


