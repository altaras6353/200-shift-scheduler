import React, { useState, useCallback, useMemo } from 'react';

const EmployeeCard = ({ employee, getAssignmentCount, onDragStart, onClick, isSelected }) => {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, employee)}
      onClick={() => onClick(employee)}
      className={`cursor-pointer p-2 border border-gray-300 rounded ${isSelected ? 'bg-blue-200' : ''}`}
    >
      {employee.name} ({employee.role}) - Shifts: {getAssignmentCount(employee.name)}
    </div>
  );
};

const ShiftCell = ({ day, shift, assignedEmployee, onDrop, onDragStart, onDragOver, isAvailable, onShiftClick, onRemoveClick, isPreferredShift }) => {
  return (
    <td
      className={`border border-black p-2 ${isAvailable ? 'bg-green-400' : ''} relative`}
      onDrop={(e) => onDrop(e, day, shift)}
      onDragOver={onDragOver}
      onClick={() => onShiftClick(day, shift)}
    >
      {isPreferredShift && (
        <span className="absolute top-0 left-0 text-xs" title="Preferred Shift">🔥</span>
      )}
      {assignedEmployee ? (
        <div
          draggable
          onDragStart={(e) => onDragStart(e, { name: assignedEmployee }, day, shift)}
          className="cursor-move flex items-center justify-between"
        >
          <span>{assignedEmployee}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemoveClick(day, shift);
            }}
            className="text-red-500 ml-2 cursor-pointer"
          >
            x
          </button>
        </div>
      ) : (
        '\u00A0'
      )}
    </td>
  );
};

const WhatsAppIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
  </svg>
);

const ToggleButton = ({ isActive, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-2 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
      isActive ? 'bg-green-500 text-white' : 'bg-white text-gray-700 border border-gray-300'
    }`}
  >
    {children}
  </button>
);

const AvailabilityEditor = ({ employee, onSave, onClose }) => {
  const [editedAvailabilities, setEditedAvailabilities] = useState(employee.availabilities);
  const [preferredShift, setPreferredShift] = useState(employee.preferredShift || {});

  const toggleAvailability = useCallback((day, shift) => {
    setEditedAvailabilities(prev => {
      const dayAvailabilities = prev[day] || [];
      if (dayAvailabilities.includes(shift)) {
        return { ...prev, [day]: dayAvailabilities.filter(s => s !== shift) };
      } else {
        return { ...prev, [day]: [...dayAvailabilities, shift].sort() };
      }
    });
  }, []);

  const setShiftAsPreferred = useCallback((day, shift) => {
    setPreferredShift({ day, shift });
  }, []);

  const weekdayShifts = ['07:00-12:30', '12:00-17:00', '17:00-21:00', '21:00-01:00', '01:00-07:00'];
  const weekendShifts = ['07:00-12:00', '12:00-17:00', '17:00-01:00', '01:00-07:00'];

  const getShiftsForDay = (day) => {
    return (day === 'Friday' || day === 'Saturday') ? weekendShifts : weekdayShifts;
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
      <div className="bg-white p-5 rounded-lg shadow-xl w-full max-w-2xl">
        <h2 className="text-xl font-bold mb-4">{employee.name} - {employee.role}</h2>
        {Object.entries(editedAvailabilities).map(([day, shifts]) => (
          <div key={day} className="mb-4">
            <h3 className="font-semibold mb-2">{day}</h3>
            <div className="flex flex-wrap gap-2">
              {getShiftsForDay(day).map(shift => (
                <ToggleButton
                  key={shift}
                  isActive={shifts.includes(shift)}
                  onClick={() => toggleAvailability(day, shift)}
                >
                  {shift}
                </ToggleButton>
              ))}
            </div>
          </div>
        ))}
        <div className="flex flex-wrap gap-2 mb-4">
          <h3 className="font-semibold mb-2">Preferred Shift:</h3>
          {Object.entries(editedAvailabilities).map(([day, shifts]) =>
            shifts.map(shift => (
              <button
                key={`${day}-${shift}`}
                className={`px-2 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                  preferredShift.day === day && preferredShift.shift === shift ? 'bg-green-500 text-white' : 'bg-white text-gray-700 border border-gray-300'
                }`}
                onClick={() => setShiftAsPreferred(day, shift)}
              >
                {day} {shift}
              </button>
            ))
          )}
        </div>
        <div className="flex justify-end mt-6">
          <button onClick={() => onSave(editedAvailabilities, preferredShift)} className="px-4 py-2 bg-blue-500 text-white rounded mr-2">Save</button>
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 text-black rounded">Cancel</button>
        </div>
      </div>
    </div>
  );
};

const ShiftScheduler = () => {
  const days = useMemo(() => ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], []);
  const hebrewDays = useMemo(() => ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], []);
  const weekdayShifts = useMemo(() => ['07:00-12:30', '12:00-17:00', '17:00-21:00', '21:00-01:00', '01:00-07:00'], []);
  const weekendShifts = useMemo(() => ['07:00-12:00', '12:00-17:00', '17:00-01:00', '01:00-07:00'], []);
  const [parseSuccess, setParseSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [employees, setEmployees] = useState([]);
  const [inputData, setInputData] = useState('');
  const [shiftAssignments, setShiftAssignments] = useState({});
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [error, setError] = useState(null);
  const [draggedEmployee, setDraggedEmployee] = useState(null);
  const [draggedFrom, setDraggedFrom] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedShift, setSelectedShift] = useState(null);
  const [availableEmployees, setAvailableEmployees] = useState([]);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [showAddEmployeeForm, setShowAddEmployeeForm] = useState(false);

  const generateDefaultAvailabilities = () => {
    const defaultAvailabilities = {};
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    days.forEach(day => {
      defaultAvailabilities[day] = [];
    });
    return defaultAvailabilities;
  };

  const [newEmployee, setNewEmployee] = useState({ 
    name: '', 
    role: '', 
    availabilities: generateDefaultAvailabilities(),
    preferredShift: null
  });

  const handleInputChange = useCallback((e) => {
    setInputData(e.target.value);
  }, []);

  const getShiftsForDay = useCallback((day) => {
    return (day === 'Friday' || day === 'Saturday') ? weekendShifts : weekdayShifts;
  }, [weekendShifts, weekdayShifts]);

  const isShiftAvailable = useCallback((employee, day, shift) => {
    if (!employee || !employee.availabilities) return false;
    return employee.availabilities[day]?.some(avail => shift.startsWith(avail.split('-')[0]));
  }, []);

  const getAssignmentCount = useCallback((employeeName) => {
    return Object.values(shiftAssignments).reduce((count, dayAssignments) => {
      return count + Object.values(dayAssignments).filter(name => name === employeeName).length;
    }, 0);
  }, [shiftAssignments]);

  const isPreferredShift = useCallback((employeeName, day, shift) => {
    const employee = employees.find(emp => emp.name === employeeName);
    return employee && employee.preferredShift && 
           employee.preferredShift.day === day && 
           employee.preferredShift.shift === shift;
  }, [employees]);

  const handleParseInput = useCallback(() => {
    try {
      const lines = inputData.trim().split('\n');
      const parsedEmployees = lines.map(line => {
        const nameRoleMatch = line.match(/^(.*?)(צו 8|מילואים|סדיר)/);
        if (!nameRoleMatch) throw new Error(`Invalid format for line: ${line}`);
        
        const [, name, role] = nameRoleMatch;
        const availabilitiesPart = line.slice(name.length + role.length);
        
        const availabilities = {};
        hebrewDays.forEach((hebrewDay, index) => {
          const dayRegex = new RegExp(`(\\d{2}:\\d{2}-\\d{2}:\\d{2} ${hebrewDay}[,\\s]*)+`, 'g');
          const matches = availabilitiesPart.match(dayRegex);
          if (matches) {
            availabilities[days[index]] = matches[0].split(',').map(shift => shift.trim().split(' ')[0]);
          }
        });

        return { name: name.trim(), role, availabilities, preferredShift: null };
      });
      setEmployees(parsedEmployees);
      setError(null);
      setParseSuccess(true);
    } catch (err) {
      console.error('Error parsing input:', err);
      setError('Error parsing input. Please check the format and try again.');
      setParseSuccess(false);
    }
  }, [inputData, days, hebrewDays]);

  const handleDragStart = useCallback((e, employee, day, shift) => {
    setDraggedEmployee(employee);
    setDraggedFrom({ day, shift });
    e.dataTransfer.setData('text/plain', employee.name);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e, day, shift) => {
    e.preventDefault();
    if (draggedEmployee) {
      setShiftAssignments(prev => {
        const newAssignments = { ...prev };
        
        if (draggedFrom) {
          if (newAssignments[draggedFrom.day]) {
            delete newAssignments[draggedFrom.day][draggedFrom.shift];
            if (Object.keys(newAssignments[draggedFrom.day]).length === 0) {
              delete newAssignments[draggedFrom.day];
            }
          }
        }

        if (!newAssignments[day]) newAssignments[day] = {};
        newAssignments[day][shift] = draggedEmployee.name;
        
        return newAssignments;
      });
    }
    setDraggedEmployee(null);
    setDraggedFrom(null);
  }, [draggedEmployee, draggedFrom]);

  const autoFillShifts = useCallback(async () => {
    setIsAutoFilling(true);
    const newAssignments = { ...shiftAssignments };
    const employeeShiftCounts = {};

    employees.forEach(emp => {
      employeeShiftCounts[emp.name] = 0;
    });

    const sortedEmployees = [...employees].sort((a, b) => {
      const priority = { 'צו 8': 3, 'מילואים': 2, 'סדיר': 1 };
      return priority[b.role] - priority[a.role];
    });

    const getShiftStartHour = (shift) => parseInt(shift.split(':')[0]);

    const isValidAssignment = (emp, day, shift) => {
      if (employeeShiftCounts[emp.name] >= 4) return false;

      const lastShift = Object.entries(newAssignments).reverse().find(([d, shifts]) => 
        Object.values(shifts).includes(emp.name)
      );
      if (lastShift) {
        const [lastDay, lastShifts] = lastShift;
        const lastShiftTime = Object.entries(lastShifts).find(([s, name]) => name === emp.name)[0];
        const hoursSinceLastShift = (days.indexOf(day) - days.indexOf(lastDay)) * 24 + 
          (getShiftStartHour(shift) - getShiftStartHour(lastShiftTime) + 24) % 24;
        if (hoursSinceLastShift < 12) return false;
      }
      return !Object.values(newAssignments[day] || {}).includes(emp.name);
    };

    const assignShift = (day, shift) => {
      // First, try to assign employees to their preferred shifts
      for (const emp of sortedEmployees) {
        if (isShiftAvailable(emp, day, shift) && isValidAssignment(emp, day, shift) && isPreferredShift(emp.name, day, shift)) {
          newAssignments[day] = { ...(newAssignments[day] || {}), [shift]: emp.name };
          employeeShiftCounts[emp.name]++;
          return true;
        }
      }

      // If no preferred assignments, assign based on availability and role priority
      for (const emp of sortedEmployees) {
        if (isShiftAvailable(emp, day, shift) && isValidAssignment(emp, day, shift)) {
          newAssignments[day] = { ...(newAssignments[day] || {}), [shift]: emp.name };
          employeeShiftCounts[emp.name]++;
          return true;
        }
      }
      return false;
    };

    for (const day of days) {
      for (const shift of getShiftsForDay(day)) {
        if (!newAssignments[day]?.[shift]) {
          await new Promise(resolve => setTimeout(resolve, 100));
          if (assignShift(day, shift)) {
            setShiftAssignments({ ...newAssignments });
          }
        }
      }
    }

    setIsAutoFilling(false);
  }, [employees, days, getShiftsForDay, isShiftAvailable, shiftAssignments, isPreferredShift]);

  const resetShiftBoard = useCallback(() => {
    setShiftAssignments({});
  }, []);

  const exportState = useCallback(() => {
    const state = { employees, shiftAssignments, inputData };
    const dataStr = JSON.stringify(state);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = 'shift_schedule.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }, [employees, shiftAssignments, inputData]);

  const importState = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const state = JSON.parse(e.target.result);
          setEmployees(state.employees);
          setShiftAssignments(state.shiftAssignments);
          setInputData(state.inputData);
          setError(null);
        } catch (err) {
          console.error('Error parsing imported file', err);
          setError('Error importing file. Please make sure it\'s a valid shift schedule file.');
        }
      };
      reader.readAsText(file);
    }
  }, []);

  const handleShiftClick = useCallback((day, shift) => {
    setSelectedShift({ day, shift });
    
    const available = employees.filter(emp => isShiftAvailable(emp, day, shift));
    setAvailableEmployees(available);
  }, [employees, isShiftAvailable]);

  const handleEmployeeClick = useCallback((employee) => {
    setSelectedEmployee(prev => (prev === employee ? null : employee));
  }, []);

  const isShiftAvailableForSelected = useCallback((day, shift) => {
    if (!selectedEmployee) return false;
    return isShiftAvailable(selectedEmployee, day, shift);
  }, [selectedEmployee, isShiftAvailable]);

  const handleRemoveClick = useCallback((day, shift) => {
    setShiftAssignments(prev => {
      const newAssignments = { ...prev };
      if (newAssignments[day] && newAssignments[day][shift]) {
        delete newAssignments[day][shift];
        if (Object.keys(newAssignments[day]).length === 0) {
          delete newAssignments[day];
        }
      }
      return newAssignments;
    });
  }, []);

  const fetchFromMake = useCallback(() => {
    setIsLoading(true);
    const webhookUrl = 'https://hook.eu2.make.com/88uu2yulb4vjhpkcafmo78xcwixil7ms';
  
    fetch(webhookUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          return response.json();
        } else {
          return response.text();
        }
      })
      .then((data) => {
        console.log('Data received from Make.com:', data);
  
        if (typeof data === 'string') {
          setInputData(data);
        } else if (data && data.stringToDisplay) {
          setInputData(data.stringToDisplay);
        } else {
          console.error('Data does not contain the expected content');
        }
      })
      .catch((error) => console.error('Error fetching data from Make.com:', error))
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const generateShiftTableText = useCallback(() => {
    let message = "*לוח משמרות:*\n\n";

    days.forEach((day, index) => {
      message += `${hebrewDays[index]}:\n`;
      const shifts = getShiftsForDay(day);
      shifts.forEach(shift => {
        const employee = shiftAssignments[day]?.[shift] || "*ללא איוש*";
        message += `${shift}: ${employee}\n`;
      });
      message += "\n";
    });

    return message;
  }, [days, hebrewDays, getShiftsForDay, shiftAssignments]);

  const sendWhatsAppMessage = useCallback(() => {
    const message = generateShiftTableText();
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  }, [generateShiftTableText]);

  const handleEditAvailabilities = useCallback((employee) => {
    setEditingEmployee(employee);
  }, []);

  const handleSaveAvailabilities = useCallback((updatedAvailabilities, preferredShift) => {
    setEmployees(prevEmployees =>
      prevEmployees.map(emp =>
        emp.name === editingEmployee.name
          ? { ...emp, availabilities: updatedAvailabilities, preferredShift }
          : emp
      )
    );
    setEditingEmployee(null);
  }, [editingEmployee]);

  const handleAddEmployee = useCallback(() => {
    if (newEmployee.name && newEmployee.role) {
      setEmployees(prev => [...prev, {
        ...newEmployee,
        availabilities: generateDefaultAvailabilities()
      }]);
      setNewEmployee({ 
        name: '', 
        role: '', 
        availabilities: generateDefaultAvailabilities(),
        preferredShift: null
      });
      setShowAddEmployeeForm(false);
    }
  }, [newEmployee]);

  const handleDeleteEmployee = useCallback((employeeToDelete) => {
    if (window.confirm(`Are you sure you want to delete ${employeeToDelete.name}?`)) {
      setEmployees(prevEmployees => prevEmployees.filter(emp => emp.name !== employeeToDelete.name));
      
      // Also remove this employee from any assigned shifts
      setShiftAssignments(prevAssignments => {
        const newAssignments = { ...prevAssignments };
        Object.keys(newAssignments).forEach(day => {
          Object.keys(newAssignments[day]).forEach(shift => {
            if (newAssignments[day][shift] === employeeToDelete.name) {
              delete newAssignments[day][shift];
            }
          });
          if (Object.keys(newAssignments[day]).length === 0) {
            delete newAssignments[day];
          }
        });
        return newAssignments;
      });
    }
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Shift Scheduler</h1>
      
      {error && <div className="text-red-500 mb-4">{error}</div>}

      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Paste Employee Data</h2>
        {isLoading && <div className="loading-bar mb-2"></div>}
        <textarea
          value={inputData}
          onChange={handleInputChange}
          placeholder="DDDownload Availabilities to Continue"
          className={`w-full h-10 mb-2 p-1 border border-gray-300 ${parseSuccess ? 'bg-green-200' : 'bg-yellow-100'}`}
        />
        <div className="flex justify-between items-center">
          <div className="flex flex-wrap items-center">
            <button onClick={handleParseInput} className="px-2 py-1 bg-green-500 text-white border-none cursor-pointer mr-2 mb-2">Convert Text</button>
            <button 
              onClick={autoFillShifts}
              disabled={isAutoFilling || employees.length === 0}
              className={`px-2 py-1 ${isAutoFilling ? 'bg-gray-400' : 'bg-green-500'} text-white border-none cursor-pointer mr-2 mb-2`}
            >
              {isAutoFilling ? 'Auto-Filling...' : 'Auto Fill'}
            </button>
            <button 
              onClick={resetShiftBoard}
              className="px-2 py-1 bg-red-500 text-white border-none cursor-pointer mr-2 mb-2"
            >
              Reset Shift Board
            </button>
            <button onClick={exportState} className="px-2 py-1 bg-blue-500 text-white border-none cursor-pointer mr-2 mb-2">Save Shifts</button>
            <input
              type="file"
              id="importInput"
              className="hidden"
              onChange={importState}
              accept=".json"
            />
            <button onClick={() => document.getElementById('importInput').click()} className="px-2 py-1 bg-blue-500 text-white border-none cursor-pointer mr-2 mb-2">
              Open Shift File
            </button>
            <button 
              onClick={sendWhatsAppMessage} 
              className="px-2 py-1 bg-green-500 text-white border-none cursor-pointer flex items-center mr-2 mb-2"
            >
              <WhatsAppIcon />
              <span className="ml-2">Send Schedule via WhatsApp</span>
            </button>
          </div>
          <div>
            <button 
              onClick={fetchFromMake} 
              className="px-2 py-1 bg-yellow-500 text-white border-none cursor-pointer mb-2"
              disabled={isLoading}
            >
              {isLoading ? 'Downloading...' : 'Download availabilities From Operators'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <h2 className="text-xl font-semibold mb-2">People ({employees.length})</h2>
          <div className="flex flex-wrap gap-2">
            {employees.map((employee, index) => (
              <div key={index} className="relative">
                <EmployeeCard 
                  employee={employee}
                  getAssignmentCount={getAssignmentCount}
                  onDragStart={handleDragStart}
                  onClick={handleEmployeeClick}
                  isSelected={selectedEmployee === employee}
                />
                <button 
                  onClick={() => handleEditAvailabilities(employee)}
                  className="absolute top-0 right-0 bg-blue-500 text-white rounded-full w-3.5 h-3.5 flex items-center justify-center text-xs leading-none"
                >
                  ✏️
                </button>
                <button 
                  onClick={() => handleDeleteEmployee(employee)}
                  className="absolute top-0 left-0 bg-red-500 text-white rounded-full w-3.5 h-3.5 flex items-center justify-center text-xs leading-none"
                >
                  ×
                </button>
              </div>
            ))}
            <button 
              onClick={() => setShowAddEmployeeForm(true)}
              className="px-2 py-1 bg-green-500 text-white rounded"
            >
              Add a person
            </button>
          </div>
        </div>

        <div className="flex-2">
          {/* Table for Sunday to Thursday */}
          <table className="border-collapse w-full mb-4">
            <thead>
              <tr>
                <th className="border border-black p-2">Day</th>
                {weekdayShifts.map((shift, index) => (
                  <th key={index} className="border border-black p-2">{shift}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {days.slice(0, 5).map((day, dayIndex) => (
                <tr key={day}>
                  <td className="border border-black p-2">{hebrewDays[dayIndex]}</td>
                  {getShiftsForDay(day).map((shift, index) => (
                    <ShiftCell
                      key={index}
                      day={day}
                      shift={shift}
                      assignedEmployee={shiftAssignments[day]?.[shift]}
                      onDrop={handleDrop}
                      onDragStart={handleDragStart}
                      onDragOver={handleDragOver}
                      isAvailable={isShiftAvailableForSelected(day, shift)}
                      onShiftClick={handleShiftClick}
                      onRemoveClick={handleRemoveClick}
                      isPreferredShift={isPreferredShift(shiftAssignments[day]?.[shift], day, shift)}
                    />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Table for Friday to Saturday */}
          <table className="border-collapse w-full">
            <thead>
              <tr>
                <th className="border border-black p-2">Day</th>
                {weekendShifts.map((shift, index) => (
                  <th key={index} className="border border-black p-2">{shift}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {days.slice(5).map((day, dayIndex) => (
                <tr key={day}>
                  <td className="border border-black p-2">{hebrewDays[dayIndex + 5]}</td>
                  {getShiftsForDay(day).map((shift, index) => (
                    <ShiftCell
                      key={index}
                      day={day}
                      shift={shift}
                      assignedEmployee={shiftAssignments[day]?.[shift]}
                      onDrop={handleDrop}
                      onDragStart={handleDragStart}
                      onDragOver={handleDragOver}
                      isAvailable={isShiftAvailableForSelected(day, shift)}
                      onShiftClick={handleShiftClick}
                      onRemoveClick={handleRemoveClick}
                      isPreferredShift={isPreferredShift(shiftAssignments[day]?.[shift], day, shift)}
                    />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedShift && (
        <div className="mt-4 p-4 border border-gray-300 rounded">
          <h2 className="text-lg font-bold">Available Employees for {selectedShift.day}, {selectedShift.shift}</h2>
          {availableEmployees.length > 0 ? (
            <ul className="list-disc list-inside">
              {availableEmployees.map(emp => (
                <li key={emp.name}>
                  {emp.name} ({emp.role})
                  {isPreferredShift(emp.name, selectedShift.day, selectedShift.shift) && (
                    <span className="ml-2" title="Preferred Shift">🔥</span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p>No employees available for this shift.</p>
          )}
        </div>
      )}

      {showAddEmployeeForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
          <div className="bg-white p-5 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Employee</h2>
            <input
              type="text"
              placeholder="Name"
              value={newEmployee.name}
              onChange={(e) => setNewEmployee(prev => ({ ...prev, name: e.target.value }))}
              className="w-full p-2 mb-2 border border-gray-300 rounded"
            />
            <select
              value={newEmployee.role}
              onChange={(e) => setNewEmployee(prev => ({ ...prev, role: e.target.value }))}
              className="w-full p-2 mb-4 border border-gray-300 rounded"
            >
              <option value="">Select Role</option>
              <option value="צו 8">צו 8</option>
              <option value="מילואים">מילואים</option>
              <option value="סדיר">סדיר</option>
            </select>
            <div className="flex justify-end">
              <button 
                onClick={handleAddEmployee}
                className="px-4 py-2 bg-green-500 text-white rounded mr-2"
              >
                Add
              </button>
              <button 
                onClick={() => setShowAddEmployeeForm(false)}
                className="px-4 py-2 bg-gray-300 text-black rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {editingEmployee && (
        <AvailabilityEditor
          employee={editingEmployee}
          onSave={handleSaveAvailabilities}
          onClose={() => setEditingEmployee(null)}
        />
      )}
    </div>
  );
};

export default ShiftScheduler;