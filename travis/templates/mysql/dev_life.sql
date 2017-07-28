-- phpMyAdmin SQL Dump
-- version 4.6.6
-- https://www.phpmyadmin.net/
--
-- Host: db
-- Generation Time: Jul 07, 2017 at 12:23 PM
-- Server version: 5.7.18
-- PHP Version: 7.0.15

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `dev_life`
--
CREATE DATABASE IF NOT EXISTS `dev_life` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `dev_life`;

-- --------------------------------------------------------

--
-- Table structure for table `DBBeverage`
--

CREATE TABLE `DBBeverage` (
  `DBId` bigint(20) UNSIGNED NOT NULL,
  `DBName` varchar(50) NOT NULL,
  `DBEnergizing` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `DBBeverage`
--

INSERT INTO `DBBeverage` (`DBId`, `DBName`, `DBEnergizing`) VALUES
(1, 'Tea', 0),
(2, 'Coffee', 1),
(3, 'Redbull', 1),
(4, 'Hot chocolate', 0),
(5, 'Soda', 0),
(6, 'Fruit juice', 0);

-- --------------------------------------------------------

--
-- Table structure for table `DBBug`
--

CREATE TABLE `DBBug` (
  `DBId` bigint(20) UNSIGNED NOT NULL,
  `DBPriority` int(11) DEFAULT NULL,
  `DBTitle` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `DBBug`
--

INSERT INTO `DBBug` (`DBId`, `DBPriority`, `DBTitle`) VALUES
(1, 5, 'There is a lama into the fridge'),
(2, 10, 'The coffee machine is broken'),
(3, 8, 'The production server is down'),
(4, 7, 'The new feature fails on prod'),
(5, 2, 'Support left because of work overload'),
(6, 2, 'Marcom escaped the cellar again');

-- --------------------------------------------------------

--
-- Table structure for table `DBDeveloper`
--

CREATE TABLE `DBDeveloper` (
  `DBId` bigint(20) UNSIGNED NOT NULL,
  `DBFirstname` varchar(50) NOT NULL,
  `DBLastName` varchar(100) NOT NULL,
  `DBBirthDate` date NOT NULL,
  `DBFKBeverage` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `DBDeveloper`
--

INSERT INTO `DBDeveloper` (`DBId`, `DBFirstname`, `DBLastName`, `DBBirthDate`, `DBFKBeverage`) VALUES
(1, 'Adrien', 'Horgnies', '1992-03-04', 1),
(2, 'Bastien', 'Michaux', '1990-01-01', 2),
(3, 'Grégory', 'Schiano', '1980-01-01', 3),
(4, 'Natalya', 'Pokrovskaya', '1987-01-01', 3);

-- --------------------------------------------------------

--
-- Table structure for table `DBDeveloper_DBBug`
--

CREATE TABLE `DBDeveloper_DBBug` (
  `DBFKDeveloper` bigint(20) UNSIGNED NOT NULL,
  `DBFKBug` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `DBDeveloper_DBBug`
--

INSERT INTO `DBDeveloper_DBBug` (`DBFKDeveloper`, `DBFKBug`) VALUES
(1, 1),
(4, 1),
(2, 2),
(3, 2),
(4, 2),
(3, 3),
(4, 3),
(1, 4),
(2, 4),
(3, 5);

-- --------------------------------------------------------

--
-- Table structure for table `DBMug`
--

CREATE TABLE `DBMug` (
  `DBId` bigint(20) UNSIGNED NOT NULL,
  `DBAppearance` varchar(500) NOT NULL,
  `DBCapacity` float DEFAULT NULL,
  `DBFKDeveloper` bigint(20) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `DBMug`
--

INSERT INTO `DBMug` (`DBId`, `DBAppearance`, `DBCapacity`, `DBFKDeveloper`) VALUES
(1, 'Big, Yellow and with a smiling emoticon', 0.35, 1),
(2, 'Sheldon Cooper from TBBT', 0.3, 2),
(3, 'Big glass with a handle, I think it\'s a pint', 0.5, NULL),
(4, 'All white with friendly messages', 0.25, 4);

-- --------------------------------------------------------

--
-- Stand-in structure for view `Developer_ManyToMany_Bug`
-- (See below for the actual view)
--
CREATE TABLE `Developer_ManyToMany_Bug` (
`developer` varchar(151)
,`bug` varchar(100)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `Developer_ManyToOne_Beverage`
-- (See below for the actual view)
--
CREATE TABLE `Developer_ManyToOne_Beverage` (
`developer` varchar(151)
,`beverage` varchar(50)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `everything`
-- (See below for the actual view)
--
CREATE TABLE `everything` (
`dev_firstname` varchar(50)
,`dev_lastname` varchar(100)
,`dev_birthdate` date
,`bev_name` varchar(50)
,`bev_energizing` varchar(5)
,`mug_appearance` varchar(500)
,`mug_capacity` float
,`bug_title` varchar(100)
,`bug_priority` int(11)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `Mug_OneToOne_Developer`
-- (See below for the actual view)
--
CREATE TABLE `Mug_OneToOne_Developer` (
`mug` varchar(500)
,`developer` varchar(151)
);

-- --------------------------------------------------------

--
-- Structure for view `Developer_ManyToMany_Bug`
--
DROP TABLE IF EXISTS `Developer_ManyToMany_Bug`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`%` SQL SECURITY DEFINER VIEW `Developer_ManyToMany_Bug`  AS  select concat(`dev`.`DBFirstname`,' ',`dev`.`DBLastName`) AS `developer`,`bug`.`DBTitle` AS `bug` from ((`DBDeveloper_DBBug` `dbug` left join `DBDeveloper` `dev` on((`dev`.`DBId` = `dbug`.`DBFKDeveloper`))) left join `DBBug` `bug` on((`bug`.`DBId` = `dbug`.`DBFKBug`))) ;

-- --------------------------------------------------------

--
-- Structure for view `Developer_ManyToOne_Beverage`
--
DROP TABLE IF EXISTS `Developer_ManyToOne_Beverage`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`%` SQL SECURITY DEFINER VIEW `Developer_ManyToOne_Beverage`  AS  select concat(`dev`.`DBFirstname`,' ',`dev`.`DBLastName`) AS `developer`,`bev`.`DBName` AS `beverage` from (`DBDeveloper` `dev` left join `DBBeverage` `bev` on((`bev`.`DBId` = `dev`.`DBFKBeverage`))) ;

-- --------------------------------------------------------

--
-- Structure for view `everything`
--
DROP TABLE IF EXISTS `everything`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`%` SQL SECURITY DEFINER VIEW `everything`  AS  select `dev`.`DBFirstname` AS `dev_firstname`,`dev`.`DBLastName` AS `dev_lastname`,`dev`.`DBBirthDate` AS `dev_birthdate`,`bev`.`DBName` AS `bev_name`,(case when (`bev`.`DBEnergizing` = 1) then 'true' else 'false' end) AS `bev_energizing`,`mug`.`DBAppearance` AS `mug_appearance`,`mug`.`DBCapacity` AS `mug_capacity`,`bug`.`DBTitle` AS `bug_title`,`bug`.`DBPriority` AS `bug_priority` from ((((`DBDeveloper` `dev` left join `DBBeverage` `bev` on((`bev`.`DBId` = `dev`.`DBFKBeverage`))) left join `DBMug` `mug` on((`mug`.`DBFKDeveloper` = `dev`.`DBId`))) left join `DBDeveloper_DBBug` `dbug` on((`dbug`.`DBFKDeveloper` = `dev`.`DBId`))) left join `DBBug` `bug` on((`bug`.`DBId` = `dbug`.`DBFKBug`))) ;

-- --------------------------------------------------------

--
-- Structure for view `Mug_OneToOne_Developer`
--
DROP TABLE IF EXISTS `Mug_OneToOne_Developer`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`%` SQL SECURITY DEFINER VIEW `Mug_OneToOne_Developer`  AS  select `mug`.`DBAppearance` AS `mug`,concat(`dev`.`DBFirstname`,' ',`dev`.`DBLastName`) AS `developer` from (`DBMug` `mug` left join `DBDeveloper` `dev` on((`dev`.`DBId` = `mug`.`DBFKDeveloper`))) ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `DBBeverage`
--
ALTER TABLE `DBBeverage`
  ADD PRIMARY KEY (`DBId`);

--
-- Indexes for table `DBBug`
--
ALTER TABLE `DBBug`
  ADD PRIMARY KEY (`DBId`);

--
-- Indexes for table `DBDeveloper`
--
ALTER TABLE `DBDeveloper`
  ADD PRIMARY KEY (`DBId`),
  ADD KEY `DBFKBeverage` (`DBFKBeverage`);

--
-- Indexes for table `DBDeveloper_DBBug`
--
ALTER TABLE `DBDeveloper_DBBug`
  ADD PRIMARY KEY (`DBFKDeveloper`,`DBFKBug`),
  ADD KEY `Dev_ManyToMany_Bug` (`DBFKBug`);

--
-- Indexes for table `DBMug`
--
ALTER TABLE `DBMug`
  ADD PRIMARY KEY (`DBId`),
  ADD UNIQUE KEY `DBDeveloper` (`DBFKDeveloper`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `DBBeverage`
--
ALTER TABLE `DBBeverage`
  MODIFY `DBId` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;
--
-- AUTO_INCREMENT for table `DBBug`
--
ALTER TABLE `DBBug`
  MODIFY `DBId` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;
--
-- AUTO_INCREMENT for table `DBDeveloper`
--
ALTER TABLE `DBDeveloper`
  MODIFY `DBId` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
--
-- AUTO_INCREMENT for table `DBMug`
--
ALTER TABLE `DBMug`
  MODIFY `DBId` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
--
-- Constraints for dumped tables
--

--
-- Constraints for table `DBDeveloper`
--
ALTER TABLE `DBDeveloper`
  ADD CONSTRAINT `Dev_ManyToOne_Bev` FOREIGN KEY (`DBFKBeverage`) REFERENCES `DBBeverage` (`DBId`);

--
-- Constraints for table `DBDeveloper_DBBug`
--
ALTER TABLE `DBDeveloper_DBBug`
  ADD CONSTRAINT `Bug_ManyToMany_Dev` FOREIGN KEY (`DBFKDeveloper`) REFERENCES `DBDeveloper` (`DBId`),
  ADD CONSTRAINT `Dev_ManyToMany_Bug` FOREIGN KEY (`DBFKBug`) REFERENCES `DBBug` (`DBId`);

--
-- Constraints for table `DBMug`
--
ALTER TABLE `DBMug`
  ADD CONSTRAINT `Mug_OneToOne_Dev` FOREIGN KEY (`DBFKDeveloper`) REFERENCES `DBDeveloper` (`DBId`);

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
