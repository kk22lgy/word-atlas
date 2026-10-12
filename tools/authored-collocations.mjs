// Deliberately selected technical collocations. Each group shares a grammatical
// pattern, but its terms and relationships are explicitly listed (no Cartesian products).
export function authoredCollocations() {
  const words = [];
  function metric(prefix, entries, example, action = 'check') {
    for (const line of entries.trim().split('\n')) {
      const [word, chinese, relation] = line.split('|');
      const definition = `${prefix} ${relation}.`;
      words.push({
        word,
        chinese,
        definition,
        example: example.replaceAll('{term}', word),
        category: 'energy',
        partOfSpeech: 'noun',
        source: 'authored',
      });
      words.push({
        word: `${action} ${word}`,
        chinese: `${action === 'monitor' ? '监测' : '检查'}${chinese}`,
        definition: `To ${action === 'monitor' ? 'observe and track' : 'examine'} ${prefix.replace(/^The /, 'the ').toLowerCase()} ${relation}.`,
        example: `During the assessment, the technician will ${action} ${word} and record the findings.`,
        category: 'energy',
        partOfSpeech: 'verb phrase',
        source: 'authored',
      });
    }
  }
  metric(
    'The electrical potential difference',
    `
cell voltage|电芯电压|across a single electrochemical cell
module voltage|模组电压|across a connected group of battery cells
pack voltage|电池包电压|across the terminals of a complete battery pack
terminal voltage|端电压|between the external terminals of an electrical device
open-circuit voltage|开路电压|across a cell when no external current flows
operating voltage|工作电压|at which a device operates under specified conditions
charging voltage|充电电压|applied to a battery during charging
discharge voltage|放电电压|available at battery terminals during discharge
cutoff voltage|截止电压|at which a charging or discharging process is stopped
upper cutoff voltage|上限截止电压|at the specified upper stopping limit for a battery
lower cutoff voltage|下限截止电压|at the specified lower stopping limit for a battery
voltage ripple|电压纹波|represented by a small periodic variation around a DC voltage
DC bus voltage|直流母线电压|between the positive and negative conductors of a DC bus
grid voltage|电网电压|at a connection point in an electricity network
phase voltage|相电压|between a phase conductor and the neutral reference
line voltage|线电压|between two phase conductors in a multiphase system
resting voltage|静置电压|across a battery after a period without external current
voltage deviation|电压偏差|by which a measured voltage differs from its reference
cell voltage difference|电芯压差|between the measured voltages of individual cells
voltage hysteresis|电压滞回|observed between charge and discharge voltage paths at comparable states`,
    'The test report records {term} under the stated measurement conditions.',
    'monitor',
  );
  metric(
    'The rate of electric charge flow',
    `
charging current|充电电流|into a battery during charging
discharge current|放电电流|from a battery during discharge
cell current|电芯电流|through an individual electrochemical cell
pack current|电池包电流|through the main circuit of a battery pack
peak current|峰值电流|at the highest specified or measured instantaneous level
continuous current|持续电流|that a device carries over a specified continuous operating period
pulse current|脉冲电流|during a short pulse rather than sustained operation
leakage current|漏电流|through an unintended or normally insulating path
fault current|故障电流|through a circuit during an electrical fault
short-circuit current|短路电流|through a low-resistance unintended connection
balancing current|均衡电流|used to reduce differences in charge between cells
standby current|待机电流|drawn by a device while it is waiting to operate
inrush current|涌入电流|drawn briefly when equipment is first energized
ripple current|纹波电流|represented by a varying component superimposed on a steady current
current imbalance|电流不平衡|represented by unequal currents in parallel paths or phases
DC current|直流电流|that maintains a single direction through a circuit
AC current|交流电流|that reverses direction periodically
ground fault current|接地故障电流|through an unintended connection to ground`,
    'The monitoring system tracks {term} while the equipment is operating.',
    'monitor',
  );
  metric(
    'The amount of electric charge',
    `
cell capacity|电芯容量|that an individual cell can deliver under specified conditions
module capacity|模组容量|that a battery module can deliver under specified conditions
pack capacity|电池包容量|that a complete battery pack can deliver under specified conditions
usable capacity|可用容量|available within the permitted battery operating window
remaining capacity|剩余容量|estimated to remain available at a particular time
initial capacity|初始容量|measured at the beginning of a defined test or service period
measured capacity|实测容量|determined during a specified capacity test
discharge capacity|放电容量|delivered during a discharge measurement
charge capacity|充电容量|supplied during a charging measurement
reversible capacity|可逆容量|that can be repeatedly stored and released by an electrode or cell
irreversible capacity|不可逆容量|lost to processes that are not recovered in the corresponding cycle
specific capacity|比容量|stored or delivered per unit mass of active material
areal capacity|面容量|stored or delivered per unit electrode area
residual capacity|残余容量|still available after a specified process or period
end-of-life capacity|寿命终止容量|remaining when a specified end-of-life criterion is reached
capacity retention|容量保持量|retained relative to a reference capacity, often reported as a percentage
capacity loss|容量损失|by which available capacity has decreased from a reference value
capacity mismatch|容量不匹配|represented by different available capacities among connected cells`,
    'The laboratory evaluates {term} using the documented test procedure.',
  );
  metric(
    'The amount of stored or transferred electrical energy',
    `
usable energy|可用电量|available within the permitted operating window of a storage system
stored energy|储存能量|held in a battery or other storage device
discharged energy|放出电量|delivered from a storage device during discharge
charged energy|充入电量|supplied to a storage device during charging
remaining energy|剩余电量|estimated to remain available in a storage device
daily energy throughput|日能量吞吐量|passing through a storage system during a day under a stated counting convention
annual energy throughput|年度能量吞吐量|passing through a storage system during a year under a stated counting convention
energy throughput|能量吞吐量|passing through a storage system over a stated period and counting convention
energy consumption|能量消耗|used by equipment over a specified period
auxiliary energy consumption|辅助用电量|used by supporting equipment such as cooling and control systems
standby energy consumption|待机用电量|used while equipment is waiting to operate
energy loss|能量损失|that is not recovered as useful electrical output
conversion loss|转换能量损失|lost while electrical power is converted from one form to another
charging loss|充电损耗|not retained as useful stored energy during charging
discharge loss|放电损耗|not recovered as useful output during discharge
energy yield|能量产出|obtained from a system over a stated period`,
    'The performance report specifies the measurement boundary for {term}.',
  );
  metric(
    'The rate of electrical energy transfer',
    `
rated power|额定功率|specified by the manufacturer under defined operating conditions
charging power|充电功率|supplied to a storage system during charging
discharge power|放电功率|delivered by a storage system during discharge
active power|有功功率|that represents the real transfer of energy in an AC circuit
reactive power|无功功率|associated with periodic energy exchange in reactive AC circuit elements
apparent power|视在功率|expressed as the product of RMS voltage and RMS current for a stated circuit
peak power|峰值功率|at the highest specified or measured level
continuous power|持续功率|that a device can sustain for a specified continuous operating period
output power|输出功率|delivered from the output of a device or system
input power|输入功率|supplied to the input of a device or system
auxiliary power|辅助功率|used by supporting equipment rather than the main energy-transfer function
standby power|待机功率|used by equipment while it is waiting to operate
power demand|功率需求|required by loads at a particular time
power limit|功率限值|at the maximum or minimum value permitted by a control or equipment constraint
power reserve|功率备用|available beyond the power currently being supplied
power imbalance|功率不平衡|represented by a difference between supplied and required power
DC power|直流功率|carried by a direct-current circuit
AC power|交流功率|carried by an alternating-current circuit`,
    'The controller logs {term} alongside the operating conditions.',
    'monitor',
  );
  metric(
    'The temperature',
    `
cell temperature|电芯温度|measured at a stated location on or inside an electrochemical cell
module temperature|模组温度|measured at a stated location within a battery module
pack temperature|电池包温度|measured at a stated location in a battery pack
ambient temperature|环境温度|of the surrounding air or environment
surface temperature|表面温度|at the external surface of a component
core temperature|芯部温度|inside the central region of a component
coolant temperature|冷却液温度|of a fluid used to transfer heat away from equipment
coolant inlet temperature|冷却液入口温度|of cooling fluid as it enters the specified equipment
coolant outlet temperature|冷却液出口温度|of cooling fluid as it leaves the specified equipment
air inlet temperature|进风温度|of air entering the specified equipment
air outlet temperature|出风温度|of air leaving the specified equipment
operating temperature|运行温度|at which equipment is functioning
storage temperature|储存温度|at which a device is kept while it is not in active use
maximum cell temperature|最高电芯温度|of the hottest monitored cell at a given time
minimum cell temperature|最低电芯温度|of the coldest monitored cell at a given time
average cell temperature|平均电芯温度|calculated from a defined group of cell temperature measurements
temperature difference|温差|difference between two specified measurement points
temperature gradient|温度梯度|change per unit distance through a material or space
temperature rise|温升|increase above a stated reference temperature
temperature setpoint|温度设定值|selected as the target for a temperature control system`,
    'The thermal monitoring screen displays {term} for the selected measurement points.',
    'monitor',
  );
  metric(
    'The opposition to electrical current',
    `
contact resistance|接触电阻|at the interface between two conductive surfaces
DC internal resistance|直流内阻|estimated from a battery voltage response to a stated DC current change
AC internal resistance|交流内阻|estimated from a cell response under specified AC measurement conditions
ohmic resistance|欧姆电阻|associated with approximately linear resistive behavior
electrode resistance|电极电阻|associated with current flow through an electrode
separator resistance|隔膜电阻|associated with ionic transport through a wetted battery separator
busbar resistance|母排电阻|along a conductive bar used to distribute current
connection resistance|连接电阻|at an electrical connection between components
grounding resistance|接地电阻|between a grounding system and the surrounding earth
insulation resistance test result|绝缘电阻测试结果|reported for an insulating path under stated test conditions
charge-transfer resistance|电荷转移电阻|associated with electrochemical charge-transfer reactions at an interface
equivalent series resistance|等效串联电阻|represented by a series resistive component in an equivalent circuit`,
    'The engineer compares {term} with the corresponding reference measurement.',
  );
  metric(
    'The ratio of useful output to a specified input',
    `
charging efficiency|充电效率|for a charging process, with energy or charge accounting explicitly stated
discharge efficiency|放电效率|for a discharging process, with energy or charge accounting explicitly stated
energy efficiency|能量效率|when both input and useful output are measured as energy
coulombic efficiency|库仑效率|when recovered discharge charge is compared with supplied charge
conversion efficiency|转换效率|for a device that converts electrical power between forms
inverter efficiency|逆变效率|for conversion of DC electrical input to useful AC output
system efficiency|系统效率|for an entire system within a stated measurement boundary
DC round-trip efficiency|直流侧往返效率|for a storage cycle measured at a defined DC boundary
AC round-trip efficiency|交流侧往返效率|for a storage cycle measured at a defined AC boundary
weighted efficiency|加权效率|averaged across operating conditions using specified weights
peak efficiency|最高效率|at the operating point where a device is most efficient
partial-load efficiency|部分负载效率|when equipment operates below its rated output
full-load efficiency|满载效率|when equipment operates at its rated load
thermal efficiency|热效率|when useful work or energy output is compared with supplied thermal energy`,
    'The specification states both the test conditions and the boundary used for {term}.',
  );
  // These are purpose-written concept definitions, including abbreviations used in projects.
  const concepts = `
power|功率|The rate at which energy is transferred or converted.|Electrical power is measured in watts.
current|电流|The rate at which electric charge passes through a specified path.|The sensor measures current in the battery circuit.
voltage|电压|The electrical potential difference between two specified points.|The meter displays the voltage across the battery terminals.
charge|电荷；充电|An electrical quantity carried by particles, or the process of supplying energy to a battery.|The instrument records the charge transferred during the test.
frequency|频率|The number of repetitions of a periodic event per unit time.|The controller monitors the frequency of the AC waveform.
resistance|电阻|The opposition to electric current associated with a voltage difference under stated conditions.|The engineer measures resistance under the specified test conditions.
impedance|阻抗|The complex relationship between AC voltage and current, including resistive and reactive effects.|The impedance measurement depends on the applied frequency.
conductivity|电导率|A measure of how readily a material carries electric current.|The material has high electrical conductivity.
reactance|电抗|The component of electrical impedance associated with energy storage in electric or magnetic fields.|Reactance varies with frequency in the circuit.
inductance|电感|A property relating changing current to an induced voltage through magnetic effects.|The circuit model includes the inductance of the connection.
capacitance|电容|The ratio of stored electric charge to a corresponding voltage difference for a specified capacitor condition.|Capacitance is expressed in farads.
electrochemistry|电化学|The study of relationships between electrical and chemical processes.|Electrochemistry helps explain how rechargeable batteries operate.
oxidation|氧化|A process in which a chemical species loses electrons or increases its oxidation state.|Oxidation occurs at the anode during battery discharge.
reduction|还原|A process in which a chemical species gains electrons or decreases its oxidation state.|Reduction occurs at the cathode during battery discharge.
battery energy storage system|电池储能系统；BESS|A system combining batteries, power conversion, controls, and supporting equipment to store and supply electricity.|The battery energy storage system supplies power during the evening peak.
stationary energy storage|固定式储能|Energy storage installed at a fixed site rather than designed for regular transport.|Stationary energy storage can support a commercial building.
containerized energy storage|集装箱式储能|A storage installation whose main equipment is housed in a transportable container enclosure.|The project uses containerized energy storage beside the substation.
distributed energy storage|分布式储能|Storage resources located across a network, often close to electricity users.|Distributed energy storage can provide services at several locations.
behind-the-meter storage|表后储能|Storage connected on the customer's side of the electricity revenue meter.|Behind-the-meter storage helps the factory manage its electricity demand.
front-of-the-meter storage|表前储能|Storage connected on the grid side of a customer's electricity revenue meter.|The developer is evaluating front-of-the-meter storage for grid services.
long-duration energy storage|长时储能|Storage designed to deliver energy over extended periods, with the duration threshold depending on the application.|Long-duration energy storage can help cover prolonged supply gaps.
hybrid energy storage|混合储能|A storage arrangement combining different storage technologies or complementary storage resources.|The design combines batteries and capacitors in hybrid energy storage.
residential energy storage|户用储能|An energy storage system intended for use in a home.|Residential energy storage can retain solar energy for evening use.
commercial energy storage|商业储能|Energy storage installed to support the electricity needs of commercial premises.|The supermarket is assessing commercial energy storage.
industrial energy storage|工业储能|Energy storage used to support industrial facilities and their electrical loads.|Industrial energy storage may help manage large demand peaks.
utility-scale storage|公用事业级储能|Large storage facilities developed to provide services to electricity networks or wholesale markets.|Utility-scale storage participates in several electricity services.
microgrid controller|微电网控制器|A device or software system coordinating resources and operating modes within a microgrid.|The microgrid controller coordinates the battery and solar array.
point of common coupling|公共耦合点；PCC|The electrical point where a facility or resource connects with a wider network, as defined for the application.|The engineer records measurements at the point of common coupling.
grid connection agreement|并网协议|An agreement specifying the terms under which a facility connects to an electricity network.|The grid connection agreement defines the project connection responsibilities.
grid interconnection|电网互联；并网|The electrical connection of a resource or network to another electricity network.|The project team submitted the grid interconnection documents.
grid-forming inverter|构网型逆变器|An inverter controlled to establish a voltage waveform and support system voltage and frequency.|The study evaluates a grid-forming inverter for the microgrid.
grid-following inverter|跟网型逆变器|An inverter whose control synchronizes its output with an existing grid voltage waveform.|A grid-following inverter relies on a grid reference for normal synchronization.
bidirectional inverter|双向逆变器|Power conversion equipment capable of transferring energy in both charging and discharging directions.|The bidirectional inverter connects the battery to the AC system.
bidirectional converter|双向变换器|A power converter capable of transferring electrical energy in either direction between its ports.|The bidirectional converter supports charging and discharging.
DC-DC converter|直流变换器|A device that converts a DC electrical input to a DC output at a different voltage or other controlled condition.|The DC-DC converter links two DC voltage levels.
isolation transformer|隔离变压器|A transformer providing galvanic separation between its input and output circuits.|The isolation transformer separates the two electrical circuits.
step-up transformer|升压变压器|A transformer whose output voltage is higher than its input voltage under the stated connection.|The step-up transformer connects the plant to a higher-voltage network.
step-down transformer|降压变压器|A transformer whose output voltage is lower than its input voltage under the stated connection.|The step-down transformer supplies the auxiliary distribution board.
galvanic isolation|电气隔离|Separation preventing a direct conductive path between electrical circuits.|The design includes galvanic isolation between the specified circuits.
grounding system|接地系统|The conductors and connections linking equipment or circuits to an earth reference for specified functions.|The grounding system is included in the installation inspection.
protective earth|保护接地|An earth connection intended to support protection against electric shock.|The drawing identifies the protective earth connection.
equipotential bonding|等电位联结|Connecting conductive parts to reduce potential differences between them.|The installation documents specify equipotential bonding.
surge protection device|浪涌保护器；SPD|A device intended to limit transient overvoltages and divert surge current.|The panel includes a surge protection device.
DC circuit breaker|直流断路器|A switching device rated to interrupt current in a specified DC circuit.|The DC circuit breaker is identified in the protection diagram.
AC circuit breaker|交流断路器|A switching device rated to interrupt current in a specified AC circuit.|The AC circuit breaker connects the converter to the distribution board.
battery contactor|电池接触器|An electrically controlled switch used to connect or disconnect a battery circuit.|The battery contactor status is shown on the control screen.
precharge circuit|预充电路|A circuit that limits initial current while charging input capacitors before the main connection closes.|The precharge circuit reduces the initial current surge.
precharge resistor|预充电阻|A resistor used to limit current during a precharge sequence.|The precharge resistor appears in the circuit diagram.
current sensor|电流传感器|A device that measures electric current and produces a corresponding signal.|The current sensor sends measurements to the controller.
voltage sensor|电压传感器|A device that measures voltage and produces a corresponding signal.|The voltage sensor monitors the DC bus.
temperature sensor|温度传感器|A device that measures temperature and produces a corresponding signal.|The temperature sensor is attached at the specified measurement point.
Hall-effect sensor|霍尔传感器|A sensor that uses the Hall effect to detect a magnetic field or a related quantity such as current.|The Hall-effect sensor measures current without a direct series shunt connection.
current shunt|电流分流器|A known low resistance used to infer current from a measured voltage drop.|The current shunt provides a reference signal for the measurement.
insulation monitoring device|绝缘监测装置；IMD|A device that monitors insulation conditions in a specified electrical system.|The insulation monitoring device reports the measured insulation condition.
active balancing|主动均衡|Cell balancing that transfers energy between cells or other parts of a battery system.|Active balancing moves energy to reduce differences between cells.
passive balancing|被动均衡|Cell balancing that removes excess charge from selected cells, commonly by dissipating energy as heat.|Passive balancing dissipates energy from selected cells.
balancing resistor|均衡电阻|A resistor used to dissipate energy during a passive balancing process.|The balancing resistor is part of the cell balancing circuit.
SOC estimation|荷电状态估算|The process of estimating battery state of charge from measurements and a model or algorithm.|SOC estimation combines measured data with the battery model.
SOH estimation|健康状态估算|The process of estimating battery condition relative to a defined reference state.|SOH estimation supports long-term maintenance planning.
coulomb counting|安时积分法|Estimating charge changes by integrating measured current over time.|Coulomb counting requires careful treatment of current measurement error.
equivalent circuit model|等效电路模型|A representation of a device using circuit elements chosen to reproduce specified electrical behavior.|The equivalent circuit model reproduces the measured battery response.
electrochemical model|电化学模型|A model describing electrochemical processes such as reaction, transport, and charge transfer.|The electrochemical model describes ion transport within the cell.
extended Kalman filter|扩展卡尔曼滤波器；EKF|A state-estimation method that applies local linearization to a nonlinear system model.|The extended Kalman filter combines model predictions with measurements.
state estimation|状态估计|Inferring internal system quantities from available measurements and a model.|State estimation helps the controller interpret battery measurements.
parameter identification|参数辨识|Determining model parameter values from observed data.|Parameter identification uses results from the battery test.
lithium plating|析锂|The deposition of metallic lithium on an electrode surface under certain battery conditions.|The research examines conditions associated with lithium plating.
dendrite growth|枝晶生长|The formation and extension of branched deposits in an electrochemical system.|The study investigates dendrite growth during repeated cycling.
solid electrolyte interphase|固态电解质界面膜；SEI|A reaction-derived interfacial layer on an electrode that can conduct lithium ions while limiting further electrolyte reaction.|The solid electrolyte interphase affects cell aging and performance.
solid-state battery|固态电池|A battery that uses a solid electrolyte as a key component of its electrochemical structure.|The laboratory is testing a solid-state battery design.
sodium-ion battery|钠离子电池|A rechargeable battery in which sodium ions move between electrodes during operation.|The demonstration project compares a sodium-ion battery with other technologies.
flow battery|液流电池|A battery storing active materials in fluids circulated through an electrochemical reactor.|A flow battery stores active electrolyte in external tanks.
vanadium redox flow battery|全钒液流电池|A redox flow battery using vanadium species in its positive and negative electrolytes.|The site evaluates a vanadium redox flow battery for extended discharge.
lead-acid battery|铅酸电池|A battery using lead-based electrodes and a sulfuric-acid electrolyte.|The backup installation includes a lead-acid battery.
nickel-metal hydride battery|镍氢电池|A rechargeable battery using a nickel-based positive electrode and a hydrogen-storage alloy negative electrode.|The product uses a nickel-metal hydride battery.
supercapacitor|超级电容器|An electrochemical capacitor capable of storing charge with much greater capacitance than conventional capacitors.|The supercapacitor supplies a short burst of power.
specific energy|比能量|The amount of stored or delivered energy per unit mass.|Specific energy is reported in watt-hours per kilogram.
specific power|比功率|The power available per unit mass of a device or material.|Specific power is important for short high-power demands.
volumetric energy density|体积能量密度|The amount of stored energy per unit volume.|Volumetric energy density affects the required installation space.
gravimetric energy density|质量能量密度|The amount of stored energy per unit mass.|Gravimetric energy density affects the weight of a battery system.
electrode loading|电极载量|The quantity of electrode material deposited per unit area or other stated basis.|The experiment compares different values of electrode loading.
electrode porosity|电极孔隙率|The fraction of an electrode volume occupied by pores.|Electrode porosity affects electrolyte access and transport.
electrode thickness|电极厚度|The measured thickness of an electrode layer under stated conditions.|The manufacturer records electrode thickness during quality control.
electrolyte conductivity|电解液电导率|The ability of an electrolyte to conduct ionic current.|Electrolyte conductivity changes with composition and temperature.
ionic conductivity|离子电导率|A measure of how readily ions carry current through a material.|The report compares ionic conductivity across electrolyte samples.
electronic conductivity|电子电导率|A measure of how readily electrons carry current through a material.|Electronic conductivity influences current flow within the electrode.
charge transfer|电荷转移|The movement of electrical charge between species or across an interface.|Charge transfer at the interface influences the cell response.
ion diffusion|离子扩散|The movement of ions associated with concentration gradients and related thermodynamic driving forces.|Ion diffusion can limit the rate of an electrochemical process.
electrochemical impedance spectroscopy|电化学阻抗谱；EIS|A method characterizing a system through its response to small alternating electrical signals over a range of frequencies.|Electrochemical impedance spectroscopy helps characterize cell behavior.
cyclic voltammetry|循环伏安法；CV|An electrochemical method measuring current while electrode potential is swept through a repeated range.|Cyclic voltammetry is used to study electrode reactions.
constant current charging|恒流充电|Charging with current controlled to a specified constant value within operating constraints.|The test procedure includes constant current charging.
constant voltage charging|恒压充电|Charging with terminal voltage controlled to a specified value while current may vary.|Constant voltage charging follows the preceding phase in the test.
CC-CV charging|恒流恒压充电|A charging strategy using a constant-current phase followed by a constant-voltage phase.|The cell test uses the specified CC-CV charging profile.
charge acceptance|充电接受能力|The ability of a battery to accept charge under specified conditions.|Charge acceptance depends on the battery state and operating conditions.
charge termination|充电终止|Ending a charging process according to defined criteria.|The controller records the reason for charge termination.
deep cycling|深循环|Repeated charge-discharge operation involving a substantial depth of discharge.|The study evaluates capacity retention during deep cycling.
shallow cycling|浅循环|Repeated charge-discharge operation over a relatively small depth-of-discharge range.|Shallow cycling is included in the application profile.
equivalent full cycle|等效满循环；EFC|A throughput-based measure expressing partial cycling as an equivalent amount of full cycling under a stated convention.|The report states the convention used to calculate an equivalent full cycle.
cycle aging|循环老化|Changes in battery condition associated with repeated charging and discharging.|The experiment separates cycle aging from storage-related aging.
calendar aging|日历老化|Changes in battery condition associated with the passage of time, including during storage.|Calendar aging depends on storage temperature and battery state.
capacity fade|容量衰减|A decrease in the charge or energy capacity available from a battery.|The test tracks capacity fade over repeated cycles.
resistance growth|内阻增长|An increase in a battery's measured internal resistance over time or cycling.|Resistance growth can affect power capability.
end of life|寿命终止；EOL|The point at which a product reaches a defined limit for acceptable service.|The contract defines the battery end of life criterion.
second-life battery|梯次利用电池|A battery reused in a different application after its original service.|A second-life battery requires assessment for the new application.
battery recycling|电池回收利用|Processing used batteries to recover materials or other useful resources.|Battery recycling supports the recovery of valuable materials.
material recovery|材料回收|Recovering useful materials from products, waste, or processing streams.|The recycling plan estimates material recovery.
thermal propagation|热蔓延|The spread of heat or a thermal failure process from one component or cell to others.|The safety study evaluates thermal propagation between cells.
thermal barrier|隔热屏障|A layer or structure intended to reduce heat transfer between regions.|The design includes a thermal barrier between modules.
vent gas|泄放气体|Gas released from a cell or enclosure through a venting process.|The test records the composition of vent gas.
pressure relief valve|泄压阀|A valve intended to release fluid when a specified pressure condition occurs.|The vessel drawing identifies the pressure relief valve.
gas detection system|气体检测系统|Equipment that detects specified gases and provides corresponding indications or alarms.|The gas detection system is included in the site safety design.
smoke detection system|烟雾探测系统|Equipment that detects smoke and provides an indication or alarm.|The smoke detection system is part of the monitoring arrangement.
fire detection system|火灾探测系统|Equipment intended to detect signs of fire and initiate an indication or response.|The fire detection system reports events to the control panel.
emergency shutdown|紧急停机|A controlled stop initiated in response to an emergency condition.|The emergency shutdown function is reviewed during commissioning.
emergency stop button|急停按钮|A manually operated control intended to initiate a specified emergency stop function.|The emergency stop button is clearly identified on the panel.
fault isolation|故障隔离|Separating a faulty component or circuit from the rest of a system.|Fault isolation limits the impact of the affected circuit.
overvoltage protection|过压保护|A protective function responding when voltage exceeds a defined limit.|The design specifies overvoltage protection for the circuit.
undervoltage protection|欠压保护|A protective function responding when voltage falls below a defined limit.|Undervoltage protection is included in the control logic.
overcurrent protection|过流保护|A protective function responding when current exceeds a defined limit.|The protection review includes overcurrent protection.
overtemperature protection|过温保护|A protective function responding when temperature exceeds a defined limit.|The battery controller includes overtemperature protection.
short-circuit protection|短路保护|A protective function intended to respond to a short-circuit condition.|Short-circuit protection is documented in the system design.
ground fault protection|接地故障保护|A protective function responding to an unintended electrical connection to ground.|Ground fault protection is coordinated with other protective functions.
loss of communication|通信丢失|A condition in which an expected exchange of data is no longer available.|The controller raises an alarm after loss of communication.
communication protocol|通信协议|Rules defining how devices exchange and interpret data.|The supplier documents the supported communication protocol.
CAN bus|控制器局域网总线|A communication network using the Controller Area Network protocol.|The battery modules exchange data over a CAN bus.
Modbus TCP|Modbus TCP 协议|A form of Modbus communication carried over TCP/IP networks.|The energy controller communicates through Modbus TCP.
Modbus RTU|Modbus RTU 协议|A binary serial transmission mode of the Modbus communication protocol.|The meter uses Modbus RTU for serial communication.
RS-485 interface|RS-485 接口|An electrical interface using differential signaling for serial communication.|The device provides an RS-485 interface.
data acquisition|数据采集|Collecting measurements and signals for storage, monitoring, or analysis.|Data acquisition supports the battery performance test.
sampling rate|采样率|The number of samples collected per unit time.|The test plan specifies the required sampling rate.
alarm threshold|报警阈值|A defined value or condition that triggers an alarm.|The review checks the documented alarm threshold.
alarm acknowledgement|报警确认|An operator action recording that an alarm has been noticed, without necessarily resolving its cause.|Alarm acknowledgement is recorded in the event log.
event log|事件日志|A time-ordered record of system events and state changes.|The engineer reviews the event log after the test.
remote monitoring|远程监控|Observing system conditions through a communication link from another location.|Remote monitoring provides access to site operating data.
predictive maintenance|预测性维护|Maintenance planned using observations or models of equipment condition and likely future behavior.|Predictive maintenance uses trends in the operating data.
preventive maintenance|预防性维护|Planned maintenance intended to reduce the likelihood of failure or deterioration.|Preventive maintenance follows the approved service schedule.
corrective maintenance|纠正性维护|Maintenance performed to restore a system after a fault or defect is identified.|Corrective maintenance addresses the failed cooling component.
factory acceptance test|工厂验收测试；FAT|An agreed set of checks performed before equipment leaves the supplier's facility.|The factory acceptance test verifies the agreed functional requirements.
site acceptance test|现场验收测试；SAT|An agreed set of checks performed after equipment is installed at the project site.|The site acceptance test confirms the installed system functions.
commissioning test|调试测试|A check performed during the process of preparing equipment for intended service.|The commissioning test results are included in the handover record.
capacity test|容量测试|A test measuring the charge or energy capacity available under stated conditions.|The capacity test follows the agreed measurement procedure.
performance guarantee|性能保证|A contractual commitment that equipment will meet specified performance criteria.|The performance guarantee states the applicable test conditions.
availability guarantee|可用率保证|A commitment that a system will be available for service for a specified proportion of time under agreed rules.|The availability guarantee defines how excluded periods are treated.
degradation guarantee|衰减保证|A commitment limiting performance decline under specified service and measurement conditions.|The degradation guarantee refers to the agreed duty profile.
warranty period|质保期|The time during which specified warranty obligations apply.|The warranty period begins on the date defined in the contract.
operation and maintenance|运行与维护；O&M|The activities required to operate equipment and keep it in serviceable condition.|The operation and maintenance plan assigns responsibilities for the site.
spare parts inventory|备件库存|The collection of replacement components kept available for maintenance.|The spare parts inventory includes critical cooling components.
single-line diagram|单线图|A simplified drawing representing an electrical system using one line for each multiphase circuit.|The single-line diagram shows the main electrical connections.
electrical schematic|电气原理图|A drawing showing electrical components and their functional connections.|The electrical schematic identifies the control circuits.
as-built drawing|竣工图|A drawing updated to reflect the installation as actually constructed.|The contractor submits the as-built drawing during handover.
bill of materials|物料清单；BOM|A structured list of materials and components needed for a product or assembly.|The bill of materials lists the required battery components.
bill of quantities|工程量清单；BOQ|A document listing measured quantities of work or materials for a construction project.|The contractor prices the bill of quantities.
technical specification|技术规格书|A document defining the required technical characteristics of a product or system.|The supplier responds to each requirement in the technical specification.
design review|设计评审|A structured examination of a design against requirements and other agreed criteria.|The design review identifies outstanding engineering questions.
failure mode and effects analysis|失效模式与影响分析；FMEA|A structured method for identifying possible failure modes and examining their consequences.|Failure mode and effects analysis helps prioritize engineering attention.
root cause analysis|根本原因分析；RCA|An investigation aimed at identifying the underlying causes of a problem.|Root cause analysis follows the unexpected equipment shutdown.
hazard identification|危险源辨识|The process of recognizing conditions or events that could cause harm.|Hazard identification informs the project safety review.
risk assessment|风险评估|The evaluation of possible adverse events and their likelihood and consequences.|Risk assessment guides the selection of protective measures.
levelized cost of storage|平准化储能成本；LCOS|A discounted cost measure relating storage costs to a defined quantity of energy delivered over a project life.|The study states the assumptions behind the levelized cost of storage.
energy arbitrage|能量套利|Shifting electricity purchases and sales or consumption between periods with different prices.|The financial model includes revenue from energy arbitrage.
time-of-use tariff|分时电价|An electricity price schedule that varies by specified periods of the day or week.|The factory reviews its time-of-use tariff before scheduling charging.
demand charge|需量电费|An electricity bill component based on a defined measure of peak or contracted demand.|The bill separates the demand charge from energy charges.
ancillary services|辅助服务|Services supporting reliable electricity system operation in addition to supplying energy.|The storage project can provide specified ancillary services.
frequency response|频率响应|A change in power associated with a change in electricity system frequency.|The test measures the storage system frequency response.
voltage support|电压支撑|The use of electrical resources to help maintain voltage within desired conditions.|The inverter contributes voltage support at the connection point.
reactive power compensation|无功补偿|The provision or absorption of reactive power to meet electrical system objectives.|Reactive power compensation is included in the plant capability study.
ramp rate|爬坡速率|The rate at which power output or input changes over time.|The grid requirements specify the permitted ramp rate.
power factor|功率因数|The ratio of active power to apparent power for a stated AC system condition.|The meter reports power factor at the connection point.
harmonic distortion|谐波畸变|Distortion of an electrical waveform associated with harmonic components.|The power quality assessment includes harmonic distortion.
total harmonic distortion|总谐波畸变率；THD|A measure comparing the combined harmonic content of a waveform with its fundamental component.|The report states the calculation convention for total harmonic distortion.
power quality|电能质量|Characteristics of electricity supply such as voltage behavior and waveform quality.|The project includes a power quality monitoring plan.
load profile|负荷曲线|A representation of how electricity demand changes over time.|The engineer uses the load profile to size the storage system.
dispatch schedule|调度计划|A time-based plan for the power supplied or absorbed by energy resources.|The operator updates the dispatch schedule for the next day.
operating reserve|运行备用|Power capability kept available to respond to changes or contingencies in an electricity system.|The system operator procures operating reserve.
spinning reserve|旋转备用|Reserve capability traditionally provided by synchronized generating resources, with eligibility defined by market rules.|The market rules define which resources may provide spinning reserve.
non-spinning reserve|非旋转备用|Reserve capability available from resources not currently synchronized or supplying the relevant service, under defined response requirements.|The project evaluates eligibility for non-spinning reserve.
demand response|需求响应|Changes in electricity consumption in response to a signal, incentive, or operating requirement.|Demand response can help manage periods of high system demand.
virtual power plant|虚拟电厂；VPP|A coordinated aggregation of distributed resources operated to provide combined energy or grid services.|The virtual power plant coordinates several storage sites.
distributed energy resource|分布式能源资源；DER|An electricity supply, storage, or flexible demand resource connected within a distribution system or customer facility.|A distributed energy resource can participate in an aggregated service.
renewable integration|可再生能源并网消纳|The incorporation of renewable generation into electricity system operation and planning.|Renewable integration requires attention to network and operating conditions.
solar-plus-storage|光储结合|A project configuration combining solar generation with energy storage.|Solar-plus-storage shifts some daytime generation to later hours.
wind-plus-storage|风储结合|A project configuration combining wind generation with energy storage.|Wind-plus-storage can adjust the timing of power delivery.
curtailment reduction|减少弃电|A decrease in the amount of available generation that is intentionally not produced or delivered.|The study estimates curtailment reduction from added storage.
islanded operation|离网孤岛运行|Operation of a local electrical system while it is disconnected from the wider grid.|The microgrid plan includes islanded operation.
seamless transfer|无缝切换|A transition between operating modes with interruption limited to the stated performance requirements.|The acceptance plan defines the criteria for seamless transfer.
backup power|备用电源|Electricity supplied when the normal source is unavailable or unsuitable.|The battery provides backup power to selected loads.
uninterruptible power supply|不间断电源；UPS|Equipment intended to maintain power to a load when its normal input supply is interrupted or disturbed.|The control room uses an uninterruptible power supply.
critical load|关键负荷|An electrical load given high priority because loss of supply has important consequences.|The backup system serves the designated critical load.
black start capability|黑启动能力|The ability of a resource to help energize a power system without an external energized supply.|The project study evaluates black start capability.
automatic generation control|自动发电控制；AGC|Automatic control that adjusts resource output to support specified system balancing objectives.|The storage controller receives automatic generation control signals.
droop control|下垂控制|A control approach relating changes in output to changes in a measured system variable such as frequency.|The inverter uses droop control in the selected operating mode.
setpoint tracking|设定值跟踪|The behavior of a controlled variable as it follows a commanded reference value.|The performance test measures setpoint tracking.
response time|响应时间|The time between a specified input or event and a defined system response.|The contract defines how response time is measured.
control latency|控制延迟|The delay between a control-related input and the resulting processing or action.|Control latency includes the relevant communication and processing delays.
state-of-charge window|荷电状态窗口|The permitted range of battery state of charge for a defined operating strategy.|The operator reviews the state-of-charge window for the planned service.
depth-of-discharge limit|放电深度限制|A boundary on the fraction of capacity that may be discharged in a stated operating condition.|The duty profile includes a depth-of-discharge limit.
thermal derating|热降额|Reducing permitted output or input capability in response to temperature conditions.|The controller applies thermal derating under the specified conditions.
power derating|功率降额|Reducing a device's permitted power capability from a reference rating.|The report explains the reason for power derating.
cooling capacity|制冷能力|The rate at which a cooling system can remove heat under specified conditions.|The thermal study compares cooling capacity with the expected heat load.
heat rejection|排热|The transfer of unwanted heat from equipment to another medium or environment.|The enclosure design provides a path for heat rejection.
liquid cooling|液冷|Temperature control using a circulating liquid to transfer heat.|The battery enclosure uses liquid cooling.
air cooling|风冷|Temperature control using air to transfer heat.|The converter uses air cooling under the specified installation conditions.
coolant flow rate|冷却液流量|The amount of cooling fluid passing a point per unit time.|The monitoring system records coolant flow rate.
coolant pressure|冷却液压力|The pressure of fluid in a cooling circuit at a stated measurement point.|The sensor reports coolant pressure at the pump outlet.
leak detection|泄漏检测|The identification of unintended escape of a fluid or gas.|The cooling system includes leak detection.
heat exchanger|换热器|Equipment that transfers heat between fluids or other media without requiring them to mix.|The heat exchanger transfers heat from the cooling loop.
chiller unit|冷水机组|Equipment that removes heat from a liquid to supply a controlled cooling source.|The chiller unit serves the battery cooling circuit.
cooling loop|冷却回路|A circuit through which a cooling medium circulates to transfer heat.|The cooling loop connects the modules to the heat exchanger.
thermal interface material|导热界面材料；TIM|Material placed between surfaces to improve thermal contact and heat transfer.|The thermal interface material improves contact with the cooling plate.
cold plate|液冷板|A component designed to absorb heat from equipment and transfer it to a coolant.|The cell assembly is mounted against the cold plate.
busbar insulation|母排绝缘|Insulating material or arrangements separating busbars from unintended conductive paths.|The inspection checks busbar insulation.
creepage distance|爬电距离|The shortest path along an insulating surface between specified conductive parts.|The design review checks creepage distance.
electrical clearance|电气间隙|The shortest distance through air between specified conductive parts.|The drawing identifies the required electrical clearance.
ingress protection|外壳防护|Protection provided by an enclosure against access and the entry of solids or water under stated conditions.|The specification states the required ingress protection.
enclosure rating|外壳等级|A classification describing enclosure performance under a specified rating scheme.|The installation team checks the enclosure rating.
corrosion resistance|耐腐蚀性|The ability of a material or component to resist deterioration from chemical or environmental attack.|Corrosion resistance matters at the coastal installation.
seismic qualification|抗震鉴定|Assessment that equipment meets specified earthquake-related requirements.|The project requires seismic qualification for the equipment.
environmental test|环境试验|A test evaluating equipment under specified environmental conditions.|The environmental test includes the agreed temperature conditions.
vibration test|振动试验|A test evaluating the response of equipment to specified vibration conditions.|The vibration test follows the approved qualification plan.
thermal cycling test|温度循环试验|A test exposing equipment to repeated specified changes in temperature.|The thermal cycling test assesses the assembled component.
salt spray test|盐雾试验|A test using a controlled salt-containing mist to assess specified corrosion-related performance.|The coating is evaluated in a salt spray test.
insulation coordination|绝缘配合|Selection and arrangement of insulation characteristics in relation to expected electrical stresses and protective measures.|Insulation coordination is documented in the electrical design.
protection coordination|保护配合|Arrangement of protective functions so that their responses meet the intended selectivity and protection objectives.|The engineer reviews protection coordination for the installation.
selective tripping|选择性跳闸|Operation of protective devices intended to disconnect the affected part while retaining supply elsewhere when feasible.|Selective tripping is examined in the protection study.
lockout procedure|锁定程序|A documented process controlling isolation and prevention of unintended equipment energization.|The maintenance team follows the approved lockout procedure.
permit to work|作业许可证|A formal authorization defining conditions for specified work.|The supervisor checks the permit to work before the task.
personal protective equipment|个人防护装备；PPE|Equipment worn or used to reduce exposure to specified hazards.|The job assessment identifies the required personal protective equipment.`;
  for (const line of concepts.trim().split('\n')) {
    const [word, chinese, definition, example] = line.split('|');
    words.push({
      word: word.toLowerCase(),
      chinese,
      definition,
      example,
      category: 'energy',
      partOfSpeech: 'noun',
      source: 'authored',
    });
  }
  // Common workplace and travel actions. Objects are individually selected for each verb.
  function actions(category, verb, chineseVerb, meaning, objects, example) {
    for (const line of objects.trim().split('\n')) {
      const [object, chinese, description] = line.split('|');
      const word = `${verb} ${object}`;
      words.push({
        word,
        chinese: chineseVerb + chinese,
        definition: `To ${meaning} ${description}.`,
        example: example.replaceAll('{term}', word),
        category,
        partOfSpeech: 'verb phrase',
        source: 'authored',
      });
    }
  }
  actions(
    'business',
    'negotiate',
    '协商',
    'discuss and seek agreement on',
    `
contract terms|合同条款|the provisions of a proposed contract
payment terms|付款条件|the conditions governing when and how payment is made
delivery terms|交货条款|the conditions governing the delivery of goods
a salary increase|加薪|an increase in employment compensation
a settlement|和解方案|an agreement intended to resolve a dispute
a discount|折扣|a reduction from a quoted price
a partnership agreement|合作协议|the terms of a proposed business partnership
service fees|服务费用|the amounts charged for specified services
a renewal|续约|the continuation of an existing agreement
a deadline extension|截止期延长|additional time to complete agreed work`,
    'The project manager will {term} before the next stage begins.',
  );
  actions(
    'business',
    'review',
    '审查',
    'examine and assess',
    `
a proposal|提案|a suggested plan submitted for consideration
a contract|合同|a formal agreement and its provisions
a budget|预算|a plan of expected income and spending
project requirements|项目需求|the conditions and functions a project must satisfy
technical requirements|技术要求|the required technical characteristics of a product or system
customer feedback|客户反馈|comments from users or purchasers
performance data|绩效数据|information showing how well a process or product operates
a risk register|风险登记册|a record of identified risks and planned responses
a business case|商业论证|the reasons and evidence supporting a proposed investment
a financial statement|财务报表|a formal report of an organization's financial position or results
supplier qualifications|供应商资质|evidence of a supplier's suitability for the required work
a purchase requisition|采购申请|an internal request to obtain goods or services
an expense report|费用报告|a record of spending submitted for review
a change request|变更请求|a proposal to alter agreed requirements or work
a project schedule|项目进度计划|the planned timing of project activities
a compliance checklist|合规检查表|a list of applicable requirements to be checked
meeting minutes|会议纪要|the written record of a meeting
a sales forecast|销售预测|an estimate of future sales
a draft agreement|协议草案|a preliminary version of a proposed agreement
an action plan|行动计划|a set of planned steps for achieving an objective`,
    'Before the meeting, our team will {term} and note any outstanding questions.',
  );
  actions(
    'business',
    'prepare',
    '编制',
    'make ready',
    `
a quotation|报价|a document stating an expected price for goods or services
an invoice|账单|a document listing the amount owed for supplied goods or services
a purchase order|采购订单|a formal buyer's request for specified goods or services
a progress report|进展报告|a document summarizing work completed and outstanding
a presentation|演示报告|a structured talk and supporting materials
a project brief|项目简报|a concise description of a project's purpose and requirements
a business proposal|商业提案|a plan presented to a potential client or decision maker
a cost estimate|成本估算|an assessment of the expected cost of work
a cash flow forecast|现金流预测|an estimate of future cash receipts and payments
a handover document|移交文件|a record needed to transfer responsibility for work or equipment
a tender submission|投标文件|a formal response to an invitation to bid
a meeting agenda|会议议程|a list of topics to discuss at a meeting
a training plan|培训计划|a structured arrangement for developing knowledge or skills
a contingency plan|应急预案|a plan for responding to a possible adverse event
a marketing plan|营销计划|a plan for promoting and selling a product or service
a production schedule|生产计划|a time-based plan for manufacturing activities
a maintenance schedule|维护计划|a time-based plan for service tasks
a statement of work|工作说明书|a document defining agreed work and expected results
a decision memo|决策备忘录|a concise document supporting or recording a decision
a status update|状态更新|a summary of the current condition of ongoing work`,
    'We need to {term} before the scheduled review.',
  );
  actions(
    'business',
    'resolve',
    '解决',
    'find a satisfactory solution to',
    `
a scheduling conflict|日程冲突|activities that have been arranged for incompatible times
a payment dispute|付款争议|a disagreement concerning an amount or obligation to pay
a quality issue|质量问题|a problem affecting the required standard of a product or service
a delivery delay|交货延误|a problem causing goods to arrive later than agreed
a customer complaint|客户投诉|a customer's expression of dissatisfaction
a technical issue|技术问题|a problem involving technical behavior or requirements
a misunderstanding|误解|a situation in which information has been interpreted incorrectly
a contractual dispute|合同纠纷|a disagreement about contractual obligations
an outstanding issue|未决事项|a problem that has not yet been settled
a resource conflict|资源冲突|competing demands for the same limited resources`,
    'The team will work together to {term} before it affects the next milestone.',
  );
  actions(
    'travel',
    'confirm',
    '确认',
    'verify that an arrangement is correct for',
    `
a hotel reservation|酒店预订|a room booked at a hotel
a flight reservation|航班预订|a booking for an airline journey
a train reservation|火车预订|a booked seat or journey on a train
the departure time|出发时间|the scheduled time of leaving
the arrival time|到达时间|the expected time of reaching a destination
a pickup location|接客地点|the place where a passenger will be collected
a meeting point|集合地点|the place where people have agreed to gather
a booking reference|预订编号|the identifier associated with a reservation
the baggage allowance|行李限额|the amount of baggage permitted under a ticket
the cancellation policy|取消政策|the rules applying when a booking is cancelled
the room type|房型|the category of hotel room reserved
the check-in time|入住时间|the time when registration at a hotel is available
the check-out time|退房时间|the time by which a hotel room should be vacated
a return ticket|回程票|a ticket for the journey back
an airport transfer|机场接送|transportation between an airport and another location`,
    'Could you please {term} before we finalize the itinerary?',
  );
  actions(
    'travel',
    'request',
    '申请',
    'ask for',
    `
a refund|退款|the return of money previously paid
a room upgrade|房型升级|a change to a higher category of hotel room
late check-out|延迟退房|permission to leave a hotel room later than the usual time
early check-in|提前入住|permission to register at a hotel before the usual time
an aisle seat|靠过道座位|a seat next to the passage between seat rows
a window seat|靠窗座位|a seat next to a window
special assistance|特别协助|additional help needed during a journey
a vegetarian meal|素食餐|a meal that does not include meat or fish
an extra blanket|加一条毯子|another covering for warmth
a wake-up call|叫醒服务|a telephone call intended to wake a hotel guest
a receipt|收据|a written record of a payment
a baggage receipt|行李收据|a record identifying checked baggage
a connecting room|连通房|a hotel room with an internal door to another room
a quiet room|安静客房|a hotel room with reduced exposure to noise
a wheelchair-accessible room|轮椅无障碍客房|a room designed to accommodate a wheelchair user
an itemized bill|明细账单|a bill listing individual charges
a replacement key|补发钥匙|another key to replace one that is unavailable
travel assistance|旅行协助|help with arrangements or difficulties during a trip
a booking change|更改预订|an alteration to an existing reservation
a luggage cart|行李推车|a wheeled carrier for transporting bags`,
    'At the service desk, you can {term} and explain what you need.',
  );
  actions(
    'travel',
    'arrange',
    '安排',
    'organize',
    `
an airport pickup|机场接机|transportation to collect a passenger at an airport
a guided tour|导览游|a visit led by a guide who provides information
a day trip|一日游|a journey that returns on the same day
travel insurance|旅行保险|insurance covering specified problems during a trip
hotel accommodation|酒店住宿|a place to stay in a hotel
ground transportation|地面交通|travel by road or rail rather than by air
a shuttle service|接驳服务|regular transportation between specified locations
a return journey|返程|travel back to an earlier starting point
a rental car|租赁汽车|the temporary use of a car for a fee
a walking tour|步行游览|a visit to places on foot
a local guide|当地导游|a person who explains local places and assists visitors
a connecting flight|中转航班|an onward flight taken after an earlier flight
a private transfer|私人接送|transportation reserved for a particular person or group
a ferry crossing|渡轮行程|travel across water on a ferry
a luggage transfer|行李转运|transportation of baggage between specified places`,
    'The travel coordinator can {term} before you arrive.',
  );
  actions(
    'daily',
    'schedule',
    '安排',
    'set a time for',
    `
a dental appointment|牙科预约|a visit to a dental professional
a medical appointment|就诊预约|a visit to a healthcare professional
a home inspection|房屋检查|an examination of a residential property
an appliance repair|家电维修|work to restore a household device to working condition
a grocery delivery|食品杂货配送|the delivery of household food and everyday items
a maintenance visit|上门维护|a visit to service equipment or a property
a fitness session|健身活动|a period of planned physical exercise
a language lesson|语言课程|a session for learning or practicing a language
a vehicle inspection|车辆检查|an examination of a vehicle's condition
a moving service|搬家服务|professional help transporting household belongings`,
    'I need to {term} for a time that fits my weekly routine.',
  );
  function travelNouns(kind, rows, sentence, verb) {
    for (const line of rows.trim().split('\n')) {
      const [word, chinese, description] = line.split('|');
      words.push({
        word,
        chinese,
        definition: description,
        example: sentence.replaceAll('{term}', word),
        category: 'travel',
        partOfSpeech: 'noun phrase',
        source: 'authored',
      });
      if (verb) {
        const article = /^[aeiou]/i.test(word) ? 'an' : 'a';
        const phrase = `${verb} ${article} ${word}`;
        words.push({
          word: phrase,
          chinese: `${verb === 'book' ? '预订' : verb === 'visit' ? '参观' : '选择'}${chinese}`,
          definition: `To ${verb === 'book' ? 'make a reservation for' : verb === 'visit' ? 'go to see' : 'choose'} ${article} ${word.toLowerCase()}.`,
          example: `For our next trip, we plan to ${phrase}.`,
          category: 'travel',
          partOfSpeech: 'verb phrase',
          source: 'authored',
        });
      }
    }
  }
  travelNouns(
    'ticket',
    `
one-way ticket|单程票|A ticket for travel to a destination without an included return journey.
round-trip ticket|往返票|A ticket covering a journey to a destination and a return journey.
return ticket|回程票；往返票|A ticket for a return journey, or in some varieties of English a ticket for travel out and back.
single ticket|单程票|A ticket for one journey without an included return journey.
open ticket|开放日期票|A ticket with an unspecified or flexible travel date, subject to the issuer's conditions.
flexible ticket|灵活票|A ticket allowing specified changes under relatively flexible conditions.
refundable ticket|可退票|A ticket whose price can be returned under the stated refund rules.
non-refundable ticket|不可退票|A ticket whose fare is not refundable except under specified exceptions.
discounted ticket|折扣票|A ticket sold at a reduced price under stated conditions.
advance ticket|预售票|A ticket bought before the journey, often subject to a particular advance-purchase fare.
electronic ticket|电子票|A travel ticket recorded electronically rather than issued only as a paper document.
paper ticket|纸质票|A ticket issued as a physical printed document.
mobile ticket|手机电子票|A ticket displayed or stored on a mobile device for validation.
connecting ticket|联程票|A ticket covering an onward connection as part of a journey.
through ticket|通程票|A ticket covering a journey across more than one service or section.
first-class ticket|头等票|A ticket for the highest designated passenger class on a service.
business-class ticket|商务舱票|A ticket for a designated business class of passenger service.
economy-class ticket|经济舱票|A ticket for a standard economy class of airline service.
premium economy ticket|高端经济舱票|A ticket for an airline cabin category between standard economy and business class.
standby ticket|候补票|A ticket or travel arrangement under which boarding depends on available space and carrier rules.
group ticket|团体票|A ticket or ticket arrangement covering several people traveling together.
season ticket|季票；定期票|A ticket allowing repeated travel or admission during a specified period.
day pass|一日通票|A pass allowing specified travel or admission during one day.
weekly pass|周票|A pass allowing specified use during a week.
monthly pass|月票|A pass allowing specified use during a month.
rail pass|铁路通票|A pass allowing rail travel within stated routes, dates, and conditions.
city pass|城市通票|A pass combining specified transport or attraction benefits within a city.
museum pass|博物馆通票|A pass allowing admission to specified museums under stated conditions.
transit pass|公共交通通票|A pass allowing use of specified public transportation services.
boarding priority|优先登机权|An entitlement or arrangement to board before some other passengers.
seat reservation|座位预订|An arrangement assigning a particular seat to a passenger.
reserved seat|预留座位|A seat kept for a particular passenger or booking.
unreserved seat|非预订座位|A seat available without a specific prior seat allocation.
fare difference|票价差额|The difference between two applicable ticket prices.
booking fee|预订费|An additional charge for making a reservation.
cancellation fee|取消费|A charge applied when a reservation or service is cancelled.
change fee|改签费|A charge applied to a permitted change to a booking.
excess baggage fee|超额行李费|A charge for baggage exceeding the applicable allowance.
airport tax|机场税费|A tax or charge associated with airport or passenger services.
fuel surcharge|燃油附加费|An additional charge attributed to fuel-related costs.`,
    'Please check the conditions attached to your {term}.',
  );
  travelNouns(
    'flight',
    `
direct flight|直达航班|A flight marketed under one flight number that may include an intermediate stop.
non-stop flight|不经停航班|A flight traveling between origin and destination without an intermediate landing.
connecting flight|中转航班|An onward flight taken after an earlier flight as part of a journey.
domestic flight|国内航班|A flight between locations within the same country.
international flight|国际航班|A flight between locations in different countries.
long-haul flight|长途航班|A flight over a long distance, with the threshold depending on the carrier or context.
short-haul flight|短途航班|A flight over a relatively short distance, with the threshold depending on the context.
overnight flight|过夜航班|A flight operating through the night or extending into the following day.
red-eye flight|红眼航班|A flight departing at night and typically arriving the next morning.
charter flight|包机航班|A flight arranged for a particular customer or group rather than only as a regular scheduled service.
scheduled flight|定期航班|A flight operated according to a published schedule.
early morning flight|清晨航班|A flight departing in the early part of the morning.
late-night flight|深夜航班|A flight departing or operating late at night.
return flight|返程航班|A flight taking a passenger back toward the starting point.
outbound flight|去程航班|A flight traveling away from the journey's starting location.
inbound flight|到港航班|A flight arriving at a particular airport or destination.
budget flight|廉价航班|A flight marketed with relatively low fares, often with separate charges for additional services.
codeshare flight|代码共享航班|A flight operated by one airline and also marketed under another airline's code.
repatriation flight|遣返或接返航班|A flight arranged to return people to their home country.
scenic flight|观光飞行|A flight taken primarily to view landscapes or attractions from the air.`,
    'We compared the available options before choosing a {term}.',
    'book',
  );
  travelNouns(
    'room',
    `
single room|单人房|A hotel room intended for one guest.
double room|双人床房|A hotel room typically providing one bed intended for two people, subject to local naming conventions.
twin room|双床房|A hotel room typically containing two separate beds.
triple room|三人房|A hotel room intended to accommodate three guests.
family room|家庭房|A hotel room arranged to accommodate a family, with occupancy defined by the hotel.
connecting room|连通房|A hotel room linked to another room by an internal doorway.
adjoining room|相邻客房|A hotel room next to another room, without necessarily having an internal connecting door.
accessible room|无障碍客房|A hotel room designed with features supporting guests with specified accessibility needs.
non-smoking room|无烟房|A hotel room in which smoking is not permitted.
ocean-view room|海景房|A hotel room with a view of the sea.
city-view room|城景房|A hotel room with a view across part of a city.
garden-view room|园景房|A hotel room overlooking a garden or landscaped area.
courtyard room|庭院客房|A hotel room facing or arranged around an internal courtyard.
standard room|标准客房|A room in a hotel's basic designated accommodation category.
deluxe room|豪华客房|A room in a hotel's higher designated accommodation category, with features defined by that hotel.
superior room|高级客房|A room marketed as above the hotel's standard category, with details defined by that hotel.
studio apartment|单间公寓|An apartment combining the main living and sleeping areas in one room.
serviced apartment|服务式公寓|An apartment offered with specified hospitality or housekeeping services.
hotel suite|酒店套房|Hotel accommodation comprising a larger or multi-area arrangement of rooms.
junior suite|小型套房|A hotel accommodation category typically combining a sleeping area with additional sitting space.
penthouse suite|顶层套房|A suite located on or near the top floor of a building.
budget room|经济客房|A room offered at a relatively low price with a defined set of facilities.
dormitory bed|宿舍床位|A sleeping place in a shared room, commonly in a hostel.
private room|独立客房|A room reserved for the exclusive use of a particular guest or group.
shared room|合住客房|A room used by more than one guest or booking party.
wheelchair-accessible room|轮椅无障碍客房|A room designed with features supporting access and use by wheelchair users.
pet-friendly room|宠物友好客房|A room where guests may stay with specified pets under the property's rules.
soundproof room|隔音客房|A room built or treated to reduce transmission of sound.
air-conditioned room|空调客房|A room equipped with a system for controlling indoor air temperature.
self-catering apartment|自炊公寓|An apartment with facilities for guests to prepare their own meals.`,
    'The hotel confirmed the facilities included with our {term}.',
    'book',
  );
  travelNouns(
    'attraction',
    `
historic district|历史街区|An area containing buildings and places of recognized historical interest.
heritage site|遗产地|A place valued for its cultural, historical, or natural significance.
archaeological site|考古遗址|A place where remains of past human activity are studied or preserved.
ancient ruins|古代遗迹|The surviving remains of old buildings or settlements.
national park|国家公园|A protected area designated under a country's national park system.
nature reserve|自然保护区|An area managed to protect wildlife, habitats, or natural features.
botanical garden|植物园|A garden where plants are grown and displayed for study, conservation, or public interest.
sculpture garden|雕塑公园|An outdoor area where sculptures are displayed.
art gallery|美术馆|A place displaying works of art.
science museum|科技博物馆|A museum presenting scientific ideas, discoveries, or technology.
history museum|历史博物馆|A museum presenting objects and information about the past.
open-air museum|露天博物馆|A museum whose exhibits are mainly outdoors.
visitor center|游客中心|A facility providing information and services to visitors.
observation deck|观景台|An elevated or specially arranged platform for viewing the surroundings.
scenic viewpoint|风景观景点|A place selected for its attractive view.
coastal trail|海岸步道|A walking route following or overlooking a coast.
mountain trail|山地步道|A walking route through mountainous terrain.
hiking trail|徒步路线|A marked or recognized route for walking through natural areas.
walking route|步行路线|A path or planned course intended to be followed on foot.
cycling route|骑行路线|A path or planned course intended for bicycle travel.
waterfront promenade|滨水步道|A walkway along the edge of a body of water.
pedestrian street|步行街|A street primarily or exclusively intended for people on foot.
night market|夜市|A market operating mainly during evening or nighttime hours.
farmers market|农夫市集|A market where producers or vendors sell agricultural products directly to customers.
flea market|跳蚤市场|A market selling used goods and other small items.
food market|食品市场|A market primarily selling food ingredients or prepared foods.
cultural festival|文化节|An organized event celebrating cultural activities or traditions.
music festival|音乐节|An organized event featuring multiple musical performances.
local landmark|当地地标|A recognizable feature or building associated with a particular area.
historic monument|历史纪念建筑|A structure recognized for historical or commemorative importance.`,
    'Our itinerary includes time to explore the {term}.',
  );
  travelNouns(
    'service',
    `
airport lounge|机场休息室|A designated airport area offering seating and specified passenger services.
departure lounge|候机室|An area where passengers wait before boarding a departing service.
boarding gate|登机口|The airport access point used to board a particular flight.
departure board|出发信息显示板|A display listing departure details and service status.
arrival board|到达信息显示板|A display listing arrival details and service status.
information desk|问讯处|A staffed location where visitors can ask for information.
lost property office|失物招领处|An office handling items that have been found or reported missing.
baggage carousel|行李转盘|A moving conveyor used to distribute arriving checked baggage.
baggage tag|行李标签|A label identifying a bag and its routing or owner.
baggage allowance|行李限额|The amount of baggage permitted under a ticket or service policy.
checked bag|托运行李箱|A bag handed to a carrier for transport outside the passenger cabin.
carry-on bag|随身行李包|A bag taken into the passenger cabin under the carrier's conditions.
oversized baggage|超尺寸行李|Baggage exceeding the standard size limits set by a carrier.
fragile baggage|易碎行李|Baggage containing items that require particular care to avoid damage.
travel document|旅行证件|An official document needed or used for a journey.
entry permit|入境许可|An authorization allowing entry under specified conditions.
transit visa|过境签证|A visa permitting transit through a country under its stated rules.
visa waiver|免签安排|An arrangement allowing eligible travelers to enter without obtaining a specified visa.
immigration officer|入境检查官员|An official responsible for checking a person's right to enter or remain in a country.
customs declaration|海关申报|A statement of goods or information required by customs authorities.
currency exchange counter|货币兑换柜台|A service point where one currency can be exchanged for another.
foreign transaction fee|境外交易手续费|A charge applied to an eligible transaction involving a foreign merchant or currency.
emergency contact|紧急联系人|A person or service designated to be contacted in an urgent situation.
consular assistance|领事协助|Help provided by a country's consular representatives under applicable arrangements.
travel advisory|旅行提示|Official or organizational information about conditions relevant to travel.
travel disruption|旅行中断|An event that interferes with planned travel arrangements.
missed connection|错过接驳|A situation in which a traveler does not reach an onward service in time.
flight cancellation|航班取消|The withdrawal of a planned flight from operation.
flight delay|航班延误|A departure or arrival occurring later than the scheduled time.
travel reimbursement|差旅报销|Repayment of eligible expenses incurred during a journey.`,
    'Please ask the travel coordinator for details about the {term}.',
  );
  function businessNouns(rows) {
    for (const line of rows.trim().split('\n')) {
      const [word, chinese, definition] = line.split('|');
      words.push({
        word,
        chinese,
        definition,
        example: `The team discussed the ${word} during the project review.`,
        category: 'business',
        partOfSpeech: 'noun phrase',
        source: 'authored',
      });
    }
  }
  businessNouns(`
accounts payable|应付账款|Amounts a business owes to suppliers or other creditors for goods and services received.
accounts receivable|应收账款|Amounts owed to a business by customers or other debtors.
working capital|营运资本|A measure commonly calculated as current assets minus current liabilities.
operating expense|营业费用|A cost incurred in the ordinary operation of a business under the applicable accounting treatment.
capital expenditure|资本性支出|Spending to acquire or improve assets expected to provide benefits over more than one period.
gross profit|毛利润|Revenue less the cost of goods or services sold under the stated accounting basis.
net profit|净利润|The profit remaining after the relevant expenses and other charges are deducted.
operating profit|营业利润|Profit arising from operating activities under the stated accounting treatment.
gross margin|毛利率|Gross profit expressed as a proportion of revenue.
operating margin|营业利润率|Operating profit expressed as a proportion of revenue.
break-even point|盈亏平衡点|The level of activity at which total relevant revenue equals total relevant cost.
fixed cost|固定成本|A cost that remains unchanged within a specified activity range and period.
variable cost|可变成本|A cost that changes with the relevant level of activity.
unit cost|单位成本|The cost allocated or incurred per unit of output under a stated method.
cost allocation|成本分摊|Assigning shared or indirect costs to defined activities, products, or other cost objects.
cost center|成本中心|An organizational unit or accounting category used to collect and control costs.
profit center|利润中心|An organizational unit assessed on revenues and costs attributable to it.
budget variance|预算差异|The difference between a budgeted amount and the corresponding actual amount.
expense claim|费用报销申请|A request for repayment of eligible costs incurred for an organization.
payment schedule|付款计划|The agreed timing and amounts of payments.
payment milestone|付款里程碑|An agreed event or stage that triggers a payment obligation.
advance payment|预付款|Money paid before the corresponding goods, services, or contractual stage are completed.
down payment|首付款|An initial payment forming part of a larger purchase price.
retention payment|保留款|An amount withheld until specified contractual conditions are met.
overdue payment|逾期款项|A payment that has not been made by the agreed due date.
credit note|贷项通知单|A document recording a reduction in an amount previously billed or owed.
debit note|借项通知单|A document recording an adjustment increasing an amount due under the stated accounting use.
pro forma invoice|形式发票|A preliminary document describing expected goods, prices, or transaction details before a final invoice.
commercial invoice|商业发票|A document stating the goods supplied and transaction value, commonly used in international trade.
bank guarantee|银行保函|A bank's undertaking to make a specified payment if stated conditions are met.
letter of credit|信用证|A bank undertaking to pay subject to presentation of documents meeting stated conditions.
performance bond|履约保函|A financial assurance supporting specified contractual performance obligations.
bid bond|投标保函|A financial assurance associated with a bidder's specified tender obligations.
liquidated damages|约定损害赔偿金|A contractually specified amount or method for compensation upon a defined breach, subject to applicable law.
limitation of liability|责任限制|A contractual provision limiting specified liabilities or remedies, subject to applicable law.
force majeure clause|不可抗力条款|A contract provision addressing specified events beyond a party's control and their contractual consequences.
termination clause|终止条款|A contractual provision defining circumstances and procedures for ending an agreement.
confidentiality agreement|保密协议|An agreement establishing obligations concerning the use or disclosure of specified information.
non-disclosure agreement|不披露协议；NDA|An agreement restricting disclosure of defined confidential information.
service-level agreement|服务水平协议；SLA|An agreement defining service performance commitments and related measurement or remedy arrangements.
master service agreement|主服务协议|An agreement establishing general terms governing subsequent specified service work.
framework agreement|框架协议|An agreement setting terms for future transactions or work under a defined arrangement.
distribution agreement|经销协议|An agreement defining how a distributor may market or sell specified products.
licensing agreement|许可协议|An agreement granting specified rights to use intellectual property or other licensed subject matter.
joint venture agreement|合资协议|An agreement governing a business undertaking shared by two or more parties.
memorandum of understanding|谅解备忘录；MOU|A document recording shared intentions or understandings, with legal effect depending on its terms and context.
request for information|信息征询书；RFI|A document seeking information from potential suppliers or other parties.
request for quotation|询价书；RFQ|A request asking potential suppliers to quote prices and specified commercial details.
request for proposal|征求建议书；RFP|A request inviting proposed solutions and commercial terms for defined needs.
invitation to tender|招标邀请|A formal invitation to submit a bid for specified work or supply.
tender evaluation|评标|Assessment of submitted bids against stated evaluation criteria.
supplier evaluation|供应商评价|Assessment of a supplier against defined commercial, technical, or performance criteria.
supplier audit|供应商审核|A systematic examination of a supplier's processes or compliance against specified criteria.
vendor management|供应商管理|Coordination and oversight of an organization's relationships with external providers.
strategic sourcing|战略寻源|A structured approach to selecting and managing sources of supply in line with organizational objectives.
purchase requisition|采购申请|An internal request seeking authorization to obtain specified goods or services.
order confirmation|订单确认|A document or communication confirming acceptance and details of an order.
delivery note|送货单|A document accompanying goods and describing what is delivered.
packing list|装箱单|A document listing the contents and packaging details of a shipment.
bill of lading|提单|A transport document serving functions such as acknowledging receipt of goods and evidencing carriage terms.
certificate of origin|原产地证|A document certifying the origin of specified goods under the applicable scheme.
customs clearance|清关|Completion of the required customs procedures for movement of goods.
freight forwarding|货运代理|Arranging the transportation and related handling of goods on behalf of a shipper.
freight insurance|货物运输保险|Insurance covering specified risks associated with the transportation of goods.
last-mile delivery|最后一公里配送|The final stage of transporting goods to the receiving customer or destination.
order fulfillment|订单履行|The process of preparing, dispatching, and completing a customer order.
safety stock|安全库存|Inventory kept to help absorb uncertainty in demand or replenishment.
reorder point|再订货点|An inventory level or condition that triggers a replenishment order.
inventory turnover|存货周转率|A measure of how frequently inventory is sold or used during a period under a stated calculation.
stockout risk|缺货风险|The possibility that available inventory will not meet demand.
economic order quantity|经济订货批量；EOQ|An order quantity calculated to balance specified ordering and holding costs under model assumptions.
material requirements planning|物料需求计划；MRP|A method of planning material needs from production schedules, product structures, and inventory data.
enterprise resource planning|企业资源计划；ERP|An integrated system for managing core organizational information and processes.
customer relationship management|客户关系管理；CRM|The processes and systems used to manage interactions with customers and prospects.
key performance indicator|关键绩效指标；KPI|A defined measure used to track performance against an important objective.
return on investment|投资回报率；ROI|A measure comparing a defined investment return with its associated investment cost.
return on equity|净资产收益率；ROE|A financial measure comparing net income with a defined measure of shareholders' equity.
net present value|净现值；NPV|The value of expected cash flows discounted to a common reference time.
internal rate of return|内部收益率；IRR|A discount rate at which the net present value of specified cash flows is zero.
payback period|投资回收期|The time required for cumulative specified returns to recover an initial investment.
total cost of ownership|总拥有成本；TCO|The total relevant cost of acquiring, using, supporting, and disposing of an asset over a stated period.
customer acquisition cost|获客成本；CAC|The cost attributed to acquiring a customer under a specified calculation.
customer lifetime value|客户终身价值；CLV|An estimate of the economic value associated with a customer relationship over its expected duration.
market share|市场份额|An organization's proportion of a defined market measured on a stated basis.
market segmentation|市场细分|Dividing a market into groups with relevant shared characteristics.
target audience|目标受众|The group a communication or offering is intended to reach.
value proposition|价值主张|A statement of the benefits an offering is intended to deliver to its customers.
competitive advantage|竞争优势|A characteristic or capability enabling better performance relative to competitors on a relevant basis.
competitive analysis|竞争分析|An assessment of competitors, their offerings, and their relative strengths or positions.
pricing strategy|定价策略|An approach for setting prices in line with commercial objectives and market conditions.
sales pipeline|销售管道|The collection of sales opportunities tracked through defined stages.
sales conversion rate|销售转化率|The proportion of defined prospects or opportunities that become sales.
customer retention|客户留存|The continued maintenance of customer relationships over time.
customer churn|客户流失|The loss of customers or subscriptions during a defined period.
brand positioning|品牌定位|The intended place of a brand in the perceptions of its target market.
brand awareness|品牌知名度|The extent to which a target audience recognizes or recalls a brand.
product roadmap|产品路线图|A time-oriented plan showing the intended direction and major developments of a product.
product launch|产品发布|The introduction of a product to its intended market or users.
minimum viable product|最小可行产品；MVP|A product version with sufficient functionality to test key assumptions and obtain relevant user feedback.
proof of concept|概念验证；POC|A demonstration intended to test whether a proposed idea or approach is feasible.
pilot project|试点项目|A limited implementation used to assess an approach before wider adoption.
scope creep|范围蔓延|Uncontrolled expansion of a project's work beyond its agreed boundaries.
change control|变更控制|A structured process for assessing and authorizing changes to agreed work or requirements.
resource allocation|资源配置|Assignment of available people, time, money, or equipment to activities.
capacity planning|能力规划|Assessment and planning of the resources needed to meet expected work or output demand.
work breakdown structure|工作分解结构；WBS|A hierarchical decomposition of project work into manageable components.
critical path|关键路径|The sequence of activities determining the shortest completion time under a project's scheduling assumptions.
project dependency|项目依赖关系|A relationship in which one project activity or result depends on another.
project baseline|项目基线|An approved reference plan used to assess project performance and changes.
project governance|项目治理|The arrangements defining oversight, decisions, responsibilities, and accountability for a project.
stakeholder engagement|利益相关方参与|Interaction with people or organizations affected by a project to understand and address relevant interests.
stakeholder mapping|利益相关方分析图|Identification and representation of stakeholders according to defined characteristics or relationships.
responsibility matrix|职责矩阵|A table assigning roles or responsibilities to activities or decisions.
escalation process|升级处理流程|A defined method for referring an issue to a higher level of authority or support.
decision-making process|决策流程|The steps used to assess alternatives and select an action.
action item|待办行动项|A specific task assigned for follow-up, often with an owner and due date.
lessons learned|经验教训|Insights recorded from completed activities to improve future work.
knowledge transfer|知识传递|Sharing information, skills, or understanding between people or groups.
succession planning|继任规划|Preparation for filling important organizational roles when current holders leave or change positions.
talent acquisition|人才招聘|The process of attracting, selecting, and hiring people for organizational needs.
employee engagement|员工投入度|The degree of employees' involvement and commitment to their work and organization.
performance appraisal|绩效评估|A structured assessment of an employee's work against defined expectations.
professional development|职业发展|Activities intended to improve work-related capabilities and career readiness.
cross-functional team|跨职能团队|A group composed of people from different organizational specialties.
matrix organization|矩阵式组织|An organizational structure in which responsibilities or reporting relationships span more than one dimension.
organizational change|组织变革|A planned or observed alteration in an organization's structure, processes, or behavior.
business continuity plan|业务连续性计划；BCP|A plan for maintaining or restoring prioritized activities following a disruption.
disaster recovery plan|灾难恢复计划；DRP|A plan for restoring specified systems or services after a serious disruption.
data privacy|数据隐私|The appropriate handling and protection of information relating to individuals.
information security|信息安全|Protection of information and related systems against relevant threats to confidentiality, integrity, and availability.
access control|访问控制|Rules and mechanisms determining who or what may use a resource and in what way.
audit trail|审计追踪|A record allowing relevant actions or transactions to be traced and examined.
regulatory compliance|监管合规|Meeting the regulatory requirements applicable to an organization or activity.
due diligence|尽职调查|A systematic examination of relevant information before a transaction or decision.
conflict of interest|利益冲突|A situation in which competing interests may affect or appear to affect impartial judgment.
code of conduct|行为准则|A statement of expected behavior within an organization or activity.
corporate governance|公司治理|The arrangements through which a company is directed, overseen, and held accountable.
environmental impact|环境影响|A change in environmental conditions associated with an activity or project.
sustainability report|可持续发展报告|A document describing an organization's relevant environmental, social, and governance performance or activities.
carbon footprint|碳足迹|The quantity of greenhouse gas emissions associated with a defined activity or entity under a stated method.
carbon accounting|碳核算|Measurement and reporting of greenhouse gas emissions under a specified accounting framework.
supply chain resilience|供应链韧性|The ability of a supply network to respond to disruptions and maintain or restore its functions.
business transformation|业务转型|A substantial change in how an organization operates or creates value.
digital transformation|数字化转型|Organizational change involving the adoption and use of digital technologies and practices.`);
  return words;
}
