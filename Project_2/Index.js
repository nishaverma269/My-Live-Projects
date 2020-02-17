PCSManagement = function () {
    /**
     * 
     * @param {any} parent RoutineGroupFrequency
     * @param {any} routineGroupFrequencyOrder Existing routineGroupFrequencyOrder or falsy value (false, null, undefined, 0) for a new one
     */
    var RoutineGroupFrequencyOrder = function (parent, routineGroupFrequencyOrder) {
        var self = this;
        self._parent = parent;

        self.actionTypeId = routineGroupFrequencyOrder.actionTypeId;
        self.checkRoutineId = routineGroupFrequencyOrder.checkRoutineId;
        self.checkRoutineFrequencyId = routineGroupFrequencyOrder.checkRoutineFrequencyId;
        self.controlCharacteristic = routineGroupFrequencyOrder.controlCharacteristic;
        self.controlResponsible = routineGroupFrequencyOrder.controlResponsible;
        self.id = routineGroupFrequencyOrder.id;
        self.level8GroupProcessId = routineGroupFrequencyOrder.level8GroupProcessId;
        self.level8PreviousControlId = routineGroupFrequencyOrder.level8PreviousControlId;
        self.number = ko.observable(routineGroupFrequencyOrder.number).extend({ dirty: false });
        self.stepDescription = routineGroupFrequencyOrder.stepDescription;
        self.grandParentIndex = routineGroupFrequencyOrder.grandParentIndex;
        self.parentRowIndex = routineGroupFrequencyOrder.parentRowIndex;
        self.rowIndex = routineGroupFrequencyOrder.rowIndex;

        self._isDirty = ko.computed(function () {
            return self.number.isDirty();
        });
        //self._isAdded = ko.computed(function () {
        //    return self.id == 0;
        //});
        self._isRemoved = ko.computed(function () {
            return self.number.isDirty() && self.number() == 0;
        });

        self.clean = function () {
            self.number.markClean();
        }
    }

    /**
     * 
     * @param {any} parent Routine
     * @param {any} routineGroupFrequency Existing routineGroupFrequency to be mapped, or falsy value for a new one
     */
    var RoutineGroupFrequency = function (parent, routineGroupFrequency) {
        var self = this;
        self._parent = parent;

        self.actionTypeId = routineGroupFrequency.actionTypeId;
        self.checkRoutineId = routineGroupFrequency.checkRoutineId;
        self.frequency = routineGroupFrequency.frequency;
        self.frequencyId = routineGroupFrequency.frequencyId;
        self.id = routineGroupFrequency.id;

        // Declare Variables
        self._ordersList = ko.observableArray([]);
        self.orders = ko.observableArray([]);
        // Get Frequency Order
        self.getFrequencyOrder = function () {
            if (self._parent._selectedFrequencies().length > 0) {
                $.post('/qms/PCSManagement/GetFrequencyOrder', { databaseId: main.selectedStation().databaseId, checkRoutineFrequencyId: self.id, frequencies: self.frequency, groupIds: main.selectedStation().groupIds, originalFrequencies: self.originalFrequenciesArray() }, function (r) {
                    if (r) {
                        self._ordersList($.map(JSON.parse(r), function (val, idx) {
                            var tempArray = [];
                            var bool = false;
                            for (child of val) {
                                tempArray = tempArray.concat(new RoutineGroupFrequencyOrder(self, child));
                                if (child.id > 0) {
                                    bool = true;
                                }
                            }
                            if (bool == true) {
                                self.orders(tempArray);
                            }
                            return tempArray;
                        }));
                    }
                })// Post End
                    .done(function () {
                        for (var i = 0; i < self._ordersList().length; i++) {
                            if (self._ordersList()[i].number() == 0)
                                self._ordersList()[i].number(99);
                        }
                    })
                    .fail(function (jqXHR, textStatus, error) {
                        console.log("Post error: " + error);
                    });
            }
        }
        if (self.id == 0)
            self.orders = ko.observableArray(self._ordersList().map(function (routineGroupFrequencyOrder) { return new RoutineGroupFrequencyOrder(self._parent, routineGroupFrequencyOrder) }));

        self.originalFrequenciesArray = ko.observable(routineGroupFrequency.originalFrequency);

        // Split original frequencies into an array
        var pipeSplitArray = self.originalFrequenciesArray().toString().split(" | ");
        var commaSplitArray = pipeSplitArray.toString().split(",");
        var tempArray = [];
        for (var idx = 0; idx < commaSplitArray.length; idx++) {
            if (!tempArray.includes(commaSplitArray[idx]))
                tempArray = tempArray.concat(commaSplitArray[idx]);
        }
        self.duplicateOrderList = tempArray;

        self.parentRowIndex = routineGroupFrequency.parentRowIndex;
        self.rowIndex = routineGroupFrequency.rowIndex;
    }
    /**
   * 
   * @param {any} parent Routine
   * @param {any} routineGroup Existing routineGroup to be mapped, or falsy value for a new one
   */
    var RoutineGroup = function (parent, routineGroup, idx) {
        var self = this;
        self._parent = parent;

        self.actionTypeId = parent.id > 0 ? 99 : 1;
        self.id = parent.id > 0 ? routineGroup.id : 0;
        self.checkRoutineId = parent.id;
        self.parentRowIndex = parent.rowIndex;
        self.rowIndex = idx;
        self.groupId = parent.id > 0 ? routineGroup.groupId : routineGroup;
    }
    /**
     * 
     * @param {any} parent Main
     * @param {any} routine Existing routine to be mapped, or falsy value for a new one
     */
    var Routine = function (parent, routine) {
        var self = this;
        self._parent = parent;

        if (!routine) routine = {
            id: 0,
            name: '',
            rowIndex: null,
            actionTypeId: null,
            groups: self._parent.selectedStation().groupIds,
            frequencies: []
        }

        self.id = routine.id;
        self.name = ko.observable(routine.name).extend({ dirty: false });
        self.rowIndex = routine.rowIndex;
        self.actionTypeId = routine.actionTypeId;
        self.groups = ko.observableArray(routine.groups.map(function (routineGroup, idx) { return new RoutineGroup(self, routineGroup, idx) }));

        self._frequenciesList = ko.observableArray([]);
        self._frequenciesFilter = ko.observable('');
        self._selectedFrequencies = ko.observableArray([]);
        self._initialFrequencies = ko.observableArray([]);
        self._frequenciesList.subscribe(function () {
            setTimeout(function () {
                self._selectedFrequencies(self._frequenciesList().filter(e => e.id > 0));
                self._initialFrequencies(self._frequenciesList().filter(e => e.id > 0));
            });
        });
        self._frequenciesName = ko.computed(() => self._selectedFrequencies().map(e => e.frequency));

        self.num = 0;
        self._selectedFrequencies.subscribe(function (selection) {
            if (selection) {
                for (frequency of selection) {
                    if (frequency._ordersList().length == 0) {
                        frequency.getFrequencyOrder();
                    }
                    else {
                        if (frequency._ordersList().length > 0)
                            frequency._ordersList().concat(frequency._ordersList());
                        else
                            frequency._ordersList(frequency._ordersList());
                    }
                    for (var i = 0; i < frequency._ordersList().length; i++) {
                        if (frequency._ordersList()[i].number() == 0)
                            frequency._ordersList()[i].number(99);
                    }
                }
                setTimeout(function () { main.isLoading(false); }, 1500);
            }
        })

        self.frequencies = ko.observableArray([]);
        // Get _frequenciesList
        self.getFrequencies = function () {
            if (self._frequenciesList().length == 0) {
                $.post('/qms/PCSManagement/GetFrequencies', { checkRoutineId: self.id, databaseId: self._parent.selectedStation().databaseId, groupIds: self._parent.selectedStation().groupIds }, function (r) {
                    if (r) {
                        let tempArray = $.map(JSON.parse(r), function (val, idx) {
                            var freqobj = new RoutineGroupFrequency(self, val);
                            if (freqobj.id > 0) {
                                self.frequencies.push(freqobj);
                            }
                            return freqobj;
                        });
                        self._frequenciesList(tempArray);
                    }
                })
                    .fail(function (jqXHR, textStatus, error) {
                        console.log("Post error: " + error);
                    })
            }
        }

        if (routine.id == 0)
            self.frequencies = ko.observableArray(self._selectedFrequencies().map(function (routineGroupFrequency) { return new RoutineGroupFrequency(self._parent, routineGroupFrequency) }));

        self._isDirty = ko.computed(function () {
            let name = self.name(), groups = self.groups(), selectedFrequenciesLength = self._selectedFrequencies().length, initialFrequenciesLength = self._initialFrequencies().length == 0 ? self._selectedFrequencies().length : self._initialFrequencies().length;
            return (name !== null && name !== '') && self.name.isDirty() && groups.length > 0 || selectedFrequenciesLength > initialFrequenciesLength || selectedFrequenciesLength < initialFrequenciesLength;
        });

        self.clean = function () {
            self.name.markClean();
        }
        self._wasRemoved = false; //I use this property to flag items that have been successfully deleted so i can remove them from the page

        //Controls Order View
        self._selectedOrdersLength = ko.observable(); // Use to disable the movedown button if there is a deleted frequency 
        self._displayOrders = ko.observableArray([]); // Temp variable to sort the orders on screen
        self._orders = ko.computed(() => {  // Concat orders from all the selected frequencies and deleted frequencies in a list
            let orders = []
            //Concat selected frequencies orders
            for (let frequency of self._selectedFrequencies()) {
                orders = orders.concat(frequency._ordersList())
                self._selectedOrdersLength = orders.length;
            }
            //Concat deleted frequencies orders if any
            for (child of self._initialFrequencies()) {
                if (!self._selectedFrequencies().includes(child)) {
                    for (order of child._ordersList()) {
                        order.number(0);
                    }
                    orders = orders.concat(child._ordersList());
                }
            }
            if (self._selectedFrequencies().length > 0) {
                orders.sort(function (left, right) {
                    return (left.number() === 0 || right.number() === 0) ? 1 : ((left.number() === right.number()) ? 0 : ((left.number() < right.number()) ? -1 : 1));
                });
            }
            self._displayOrders(orders);
        });
    }

    /* Main Function */
    var Main = function () {
        var self = this;

        self.isLoading = ko.observable(false);
        /***************** STATIONS LIST *****************
         ************************************************/
        // Declare Variables
        self.qualityStationsFilter = ko.observable('');
        self.selectedStation = ko.observable(null);
        self.affectedStations = ko.computed(() => self.selectedStation() ? self.selectedStation().affectedStations : []);
        // Track Selected Station
        self.selectedStation.subscribe(function (selection) {
            if (self.selectedRoutine() && self.selectedRoutine()._isDirty()) {
                $('#unsavedAlertModal').modal('show');
            }
            else {
                self.routines([]);
                if (selection) {
                    self.getRoutines();
                }
                else {
                    self.selectedRoutine(null);
                }
            }
            self.addingRoutine(false);
        })
        /***************** ROUTINES LIST *****************
         ************************************************/
        // Declare Variables
        self.routines = ko.observableArray([]);
        self.routinesFilter = ko.observable('');
        self.selectedRoutine = ko.observable(null);
        self.routinesName = ko.computed(() => self.routines().map(e => e.name()));
        // Track Selected Routine
        self.selectedRoutine.subscribe(function (selection) {
            if (selection) {
                self.isLoading(true);
                self.selectedRoutine()._frequenciesList([]);
                self.selectedRoutine().getFrequencies();
            }
        })

        // Get Existing Routines
        self.getRoutines = function () {
            $.post('/qms/PCSManagement/GetRoutines', { databaseId: self.selectedStation().databaseId, groupIds: self.selectedStation().groupIds }, function (r) {
                if (r && r != "null") {
                    self.routines($.map(JSON.parse(r), function (val, idx) {
                        return new Routine(self, val);
                    }));
                }
            })
                .fail(function (jqXHR, textStatus, error) {
                    console.log("Post error: " + error);
                })
        }
        //Alert User if order changed
        self.updateLastAction = function (arg) {
            //Setting the order numbers after sort
            var currentOrders = self.selectedRoutine()._displayOrders();
            var num = 0;
            for (var idx = 0; idx < currentOrders.length; idx++) {
                if (currentOrders[idx].number() > 0) {
                    num = num + 1;
                    currentOrders[idx].number(num);
                }
            }
            var fromOrder = arg.sourceIndex + 1 > self.selectedRoutine()._selectedOrdersLength ? arg.item.number() : arg.sourceIndex + 1;
            var toOrder = arg.targetIndex + 1 > self.selectedRoutine()._selectedOrdersLength ? arg.item.number() : arg.targetIndex + 1;
            if (fromOrder != toOrder)
                self.saveMessage.addMessage({ css: 'alert-info', message: "Moved " + arg.item.controlCharacteristic + " from order " + fromOrder + " to " + toOrder });
        };
        self.addingRoutine = ko.observable(false);
        self.addRoutine = function () {
            console.log("Add Routine called");
            self.addingRoutine(true);
            self.selectedRoutine(null);
            //Prepare for adding a new routine
            var newRoutineObj = new Routine(self, null);
            self.routines.push(newRoutineObj);
            self.selectedRoutine(newRoutineObj);
            $('#routineFilter').prop('disabled', true);
        }
        // Undo Changes
        self.undoChanges = function () {
            $('#unsavedAlertModal').modal('hide');
            self.selectedRoutine().clean();
            self.routines([]);
            self.selectedRoutine(null);
        }
        // Remove Existing Routines
        self.deleteConfirm = ko.observable(false);
        self.removeRoutine = function () {
            self.deleteConfirm(true);
            self.save()
        }
        /***************** SAVE ROUTINE *****************
        **************************************************/
        self.saveMessage = footer.saveMessage;

        self.packageForServer = function (dirtyItems) {
            var sendThis = ko.toJSON(dirtyItems, function (key, value) {
                if (key[0] === '_' || typeof value === 'function') { return } else {
                    return value;
                }
            });

            return ko.toJSON({ values: $.parseJSON(sendThis), userId: currentUserId, databaseId: self.selectedStation().databaseId });
        }
        // Function that looks for and returns dirty items (Routine Frequency Orders)
        self.getDirtyRoutineFrequencyOrders = function (parent) {
            var dirty = [];
            var order = parent._ordersList()[0], length = parent._ordersList().length;
            for (var i = 0; i < length; i++ , order = parent._ordersList()[i]) {
                order.checkRoutineId = parent.checkRoutineId;
                order.checkRoutineFrequencyId = parent.id;
                order.rowIndex = i;
                order.parentRowIndex = parent.rowIndex;
                order.grandParentIndex = parent.parentRowIndex;

                if (order._isDirty() && order.number.isDirty() && order.number() !== 0) {
                    order.actionTypeId = order.id == 0 ? 1 : 2;
                } else {
                    order.actionTypeId = 99;
                }
                dirty.push(order);
            }
            return dirty;
        }
        // Function that looks for and returns dirty items (Routine Frequencies and their children)
        self.getDirtyRoutineFrequencies = function (parent) {
            var dirty = [];
            var idx = 0;
            var frequency = parent._selectedFrequencies()[0];
            var length = parent._selectedFrequencies().length;

            for (var i = 0; i < length; i++ , frequency = parent._selectedFrequencies()[i]) {
                frequency.checkRoutineId = parent.id;
                frequency.parentRowIndex = parent.rowIndex;
                //Compare initial frequencies with currently selected frequencies and set the actiontypeids of all frequencies with id > 0
                for (child of parent._initialFrequencies()) {
                    if (frequency.id > 0 && (frequency.actionTypeId == 0 || child.actionTypeId == 0)) {
                        if (parent._selectedFrequencies().includes(child)) {
                            currentIdx = parent._selectedFrequencies().indexOf(child);
                            parent._selectedFrequencies()[currentIdx].rowIndex = idx;
                            parent._selectedFrequencies()[currentIdx].orders = [];
                            parent._selectedFrequencies()[currentIdx].actionTypeId = 99;
                            parent._selectedFrequencies()[currentIdx].orders = self.getDirtyRoutineFrequencyOrders(parent._selectedFrequencies()[currentIdx]);
                            dirty.push(parent._selectedFrequencies()[currentIdx]);
                            idx = idx + 1;
                        }
                        else {
                            child.rowIndex = idx;
                            child.orders = self.getDirtyRoutineFrequencyOrders(child);
                            child.actionTypeId = 3;
                            dirty.push(child);
                            idx = idx + 1;
                        }
                    }
                }
                if (frequency.id == 0) {
                    frequency.rowIndex = idx;
                    frequency.orders = [];
                    frequency.actionTypeId = 1; //frequency.id > 0 ? 99 : 1;
                    frequency.orders = self.getDirtyRoutineFrequencyOrders(frequency);
                    dirty.push(frequency);
                    idx = idx + 1;
                }

            }
            return dirty;
        }
        // Function that looks for and returns dirty items (Routines and their children)
        self.getDirtyRoutines = function () {
            var dirty = [];
            var routine = self.selectedRoutine();

            // Double check and setting the order number before save
            var currentOrders = self.selectedRoutine()._displayOrders();
            var num = 0;
            for (var idx = 0; idx < currentOrders.length; idx++) {
                if (currentOrders[idx].number() > 0) {
                    num = num + 1;
                    currentOrders[idx].number(num);
                }
            }

            routine.rowIndex = 0;
            routine.frequencies = [];
            routine.name(routine.name().trim());
            if (routine._isDirty() && routine.name.isDirty()) {
                routine.actionTypeId = routine.id == 0 ? 1 : 2;
                routine.frequencies = self.getDirtyRoutineFrequencies(routine);
                dirty.push(routine);
            } else if (self.deleteConfirm()) {
                routine.actionTypeId = 3;
                dirty.push(routine);
            } else {
                routine.actionTypeId = 99;
                routine.frequencies = self.getDirtyRoutineFrequencies(routine);
                if (routine.frequencies.length) {
                    dirty.push(routine);
                }
            }
            return dirty;
        }

        self.save = function () {
            var dirtyItems = self.getDirtyRoutines();

            var tempArray = self.selectedRoutine()._selectedFrequencies();
            var nameArray = tempArray.map(e => e.frequency);
            var duplicateChecksArray = [];
            //Getting the display of duplicate checks to show in UI
            for (frequency of self.selectedRoutine()._selectedFrequencies()) {
                var tmp = [];
                if (frequency.duplicateOrderList.length > 1) {
                    for (var idx = 0; idx < frequency.duplicateOrderList.length; idx++) {
                        tmp = tmp.concat(frequency.duplicateOrderList[idx]);
                    }
                    for (var i = 0; i < frequency.duplicateOrderList.length; i++) {
                        if (!nameArray.includes(frequency.duplicateOrderList[i])) {
                            tmp.splice(tmp.indexOf(frequency.duplicateOrderList[i]), 1);
                        }
                    }
                    
                    frequency.duplicateOrderList = tmp;
                    if (frequency.duplicateOrderList.length > 1) {
                        duplicateChecksArray = duplicateChecksArray.concat(frequency.duplicateOrderList.toString().replace(/,/g, '<br>OR<br>'));
                    }
                }
            }
            
            var routineExistsCount = 0;
            for (var idx = 0; idx < self.routinesName().length; idx++) {
                if (self.routinesName()[idx].toLowerCase() == self.selectedRoutine().name().trim().toLowerCase()) {
                    routineExistsCount++;
                }
            }
            if (self.selectedRoutine().actionTypeId != 3 && duplicateChecksArray.length > 0) {   //check if duplicate checks are selected or not
                var messageString = "Frequencies with similar checks cannot be grouped. You need to select one of the frequencies from each conflict.<br><br><ul>";
                var filterDuplicates = [];
                filterDuplicates = filterDuplicates.concat(duplicateChecksArray.filter((item, index) => duplicateChecksArray.indexOf(item) === index));
                for (var i = 0; i < filterDuplicates.length; i++) {
                    messageString += "<li>" + filterDuplicates[i] + "</li><br><br>";
                }
                messageString += "</ul>";
                self.saveMessage.addMessage({ css: 'alert-warning', message: "Save Halted: There are duplicate checks in the frequencies you have selected." });
                $('#duplicateChecksModal').find('.modal-body').html(messageString);
                $('#duplicateChecksModal').modal('show');
            }
            else if (routineExistsCount > 1 && self.selectedRoutine().actionTypeId == 1) {
                self.saveMessage.addMessage({ css: 'alert-warning', message: 'Save Halted: Routine already exists' });
            }
            else if (self.selectedRoutine().name().trim() == '') {
                self.saveMessage.addMessage({ css: 'alert-warning', message: 'Save Halted: Name is Empty' });
            }
            else if (self.selectedRoutine().actionTypeId != 3 && self.selectedRoutine()._selectedFrequencies().length == 0) {
                self.saveMessage.addMessage({ css: 'alert-warning', message: 'Save Halted: Select atleast one frequency to save else remove this routine' });
            }
            else if (dirtyItems.length == 0) {   //check if dirty items are returned or not
                self.saveMessage.addMessage({ css: 'alert-warning', message: 'Save Halted: Nothing to save.' });
            }
            else {
                $.ajax({
                    method: 'POST',
                    url: '/qms/PCSManagement/SaveRoutine',
                    contentType: 'application/json',
                    dataType: 'json',
                    data: self.packageForServer(dirtyItems), //return result of the packageForServer function
                    success: function (r) {
                        //update routine
                        let routine = r[0][0];
                        //error while saving
                        if (routine.Fail) {
                            self.saveMessage.addMessage({ css: 'alert-danger', message: 'Save Failed: ' + routine.Message });
                        } else {
                            if (routine.ActionTypeId === 1 || routine.ActionTypeId === 2 || routine.ActionTypeId === 99) {
                                let tempRoutine = self.selectedRoutine();
                                self.routines.remove(tempRoutine);
                                tempRoutine.id = routine.Id;
                                self.routines.push(tempRoutine);
                                self.selectedRoutine(tempRoutine);

                                self.selectedRoutine().clean(); //each ViewModel should have a clean function that resets dirty tracked observables after a successful save
                                self.saveMessage.addMessage({ css: 'alert-success', message: 'Save Success: Routine has been saved.' });
                            }  else if (routine.ActionTypeId === 3) {
                                self.selectedRoutine()._wasRemoved = true;
                                $('#removeRoutineModal').modal('hide');
                                self.saveMessage.addMessage({ css: 'alert-success', message: 'Save Success: Routine has been removed.' });
                            }
                        }
                        //update each group in routine
                        let returnedGroups = r[1];
                        for (var i = 0; group = returnedGroups[i]; i++) {
                            //error while saving
                            if (group.Fail) {
                                self.saveMessage.addMessage({ css: 'alert-danger', message: 'Save Failed: ' + group.Message });
                            } else {
                                if (group.ActionTypeId === 1) {
                                    self.selectedRoutine().groups()[group.RowIndex].id = group.Id;
                                }
                            }
                        }
                        //update each frequency
                        let returnedFrequencies = r[2];
                        for (var i = 0; frequency = returnedFrequencies[i]; i++) {
                            //error while saving
                            if (frequency.Fail) {
                                self.saveMessage.addMessage({ css: 'alert-danger', message: 'Save Failed: ' + frequency.Message });
                            } else {
                                if (frequency.ActionTypeId === 1) {
                                    self.selectedRoutine().frequencies[frequency.RowIndex].id = frequency.Id;
                                }
                            }
                        }

                        //update each order in given frequency
                        let returnedOrders = r[3];
                        for (var i = 0; order = returnedOrders[i]; i++) {
                            //error while saving
                            if (order.Fail) {
                                self.saveMessage.addMessage({ css: 'alert-danger', message: 'Save Failed: ' + order.Message });
                            } else {
                                if (order.ActionTypeId === 1 || order.ActionTypeId === 2) {
                                    self.selectedRoutine().frequencies[order.ParentRowIndex].orders[order.RowIndex].clean();
                                    self.selectedRoutine().frequencies[order.ParentRowIndex].orders[order.RowIndex].id = order.Id;
                                }
                            }
                        }

                        //this will remove the deleted routines from the page
                        if (self.deleteConfirm()) {
                            self.routines.remove(function (routine) { return routine._wasRemoved === true; });
                        }
                        self.deleteConfirm(false);
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        self.saveMessage.addMessage({ css: 'alert-warning', message: 'Save Halted: Error in saving the data.' });
                        console.log(textStatus, errorThrown);
                    }
                });
            }
            self.addingRoutine(false);
            $('#unsavedAlertModal').modal('hide');
        };

        self.addInput = ko.observable(false);
    }; // Main ends

    // Call to main
    main = new Main();

    ko.bindingHandlers.loading = {
        init: function (element) {
            var $element = $(element),
                currentPosition = $element.css("position"),
                $loader = $("<div></div>").addClass("loader").hide();

            //add the loader div to the original element
            $element.prepend($loader);

            $loader.append('<span id="loadingSpinner" style="color:#5482a9; font-size:60px;" class="fa fa-pulse fa-spinner"></span>');

            //make sure that we can absolutely position the loader against the original element
            if (currentPosition == "auto" || currentPosition == "static")
                $element.css("position", "relative");

            //center the loader
            $loader.css({
                position: "absolute",
                top: "50%",
                left: "50%",
                "margin-top": -($loader.height() / 2) + "px"
            });
        },
        update: function (element, valueAccessor) {
            var
                //unwrap the value of the flag using knockout utilities
                isLoading = ko.utils.unwrapObservable(valueAccessor()),

                //get a reference to the parent element
                $element = $(element),

                //get a reference to the loader
                $loader = $element.find("div.loader")

            //get a reference to every *other* element
            $childrenToHide = $element.children(":not(div.loader)");

            //if we are currently loading...
            if (isLoading) {
                //...hide and disable the children...
                $childrenToHide.css("visibility", "hidden").attr("disabled", "disabled");
                //...and show the loader
                $loader.show();
            }
            else {
                //otherwise, fade out the loader
                $loader.fadeOut("fast");
                //and re-display and enable the children
                $childrenToHide.css("visibility", "visible").removeAttr("disabled");
            }
        }
    };


    ko.bindingHandlers.sortable.afterMove = main.updateLastAction;
    //Call Save Method
    $('#theSaveButton').on('click', function (e) {
        main.save();
    });
    // Unsaved Changes Alert Modal
    $('#duplicateChecksModal').on('shown.bs.modal', function () {
        $('#duplicateChecksModal').trigger('focus');
    })
    // Unsaved Changes Alert Modal
    $('#unsavedAlertModal').on('shown.bs.modal', function () {
        $('#unsavedAlertModal').trigger('focus');
    })
    // Remove Routine Modal
    $('#removeRoutineModal').on('shown.bs.modal', function () {
        $('#removeRoutineModal').trigger('focus');
    })
    // Knockout Binding
    ko.applyBindings(main, document.getElementById('content'));

}