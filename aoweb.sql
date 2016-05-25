-- phpMyAdmin SQL Dump
-- version 4.4.14
-- http://www.phpmyadmin.net
--
-- Servidor: localhost
-- Tiempo de generación: 25-05-2016 a las 05:01:36
-- Versión del servidor: 5.6.26
-- Versión de PHP: 5.6.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `aoweb`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `accounts`
--

CREATE TABLE IF NOT EXISTS `accounts` (
  `idAccount` int(11) NOT NULL,
  `nameAccount` varchar(45) DEFAULT NULL,
  `password` varchar(100) DEFAULT NULL,
  `email` varchar(45) DEFAULT NULL,
  `remember_token` varchar(60) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `balanceRazas`
--

CREATE TABLE IF NOT EXISTS `balanceRazas` (
  `idBalanceRazas` int(11) NOT NULL,
  `idRaza` int(11) NOT NULL,
  `fuerza` int(11) NOT NULL,
  `agilidad` int(11) NOT NULL,
  `inteligencia` int(11) NOT NULL,
  `constitucion` int(11) NOT NULL
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8;

--
-- Volcado de datos para la tabla `balanceRazas`
--

INSERT INTO `balanceRazas` (`idBalanceRazas`, `idRaza`, `fuerza`, `agilidad`, `inteligencia`, `constitucion`) VALUES
(1, 1, 1, 1, 0, 2),
(2, 2, -1, 3, 2, 1),
(3, 3, 2, 3, 2, 0),
(4, 4, 3, 0, -2, 3),
(5, 5, -2, 3, 4, 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `blacklist`
--

CREATE TABLE IF NOT EXISTS `blacklist` (
  `idBlackList` int(11) NOT NULL,
  `ip` varchar(45) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `characters`
--

CREATE TABLE IF NOT EXISTS `characters` (
  `idCharacter` int(11) NOT NULL,
  `idAccount` int(11) NOT NULL,
  `nameCharacter` varchar(45) NOT NULL,
  `idClase` int(11) NOT NULL,
  `map` int(11) DEFAULT NULL,
  `posX` int(11) DEFAULT '0',
  `posY` int(11) DEFAULT '0',
  `gold` int(11) NOT NULL,
  `idHead` int(11) DEFAULT NULL,
  `idLastHead` int(11) NOT NULL,
  `idLastBody` int(11) NOT NULL,
  `idLastHelmet` int(11) NOT NULL,
  `idLastWeapon` int(11) NOT NULL,
  `idLastShield` int(11) NOT NULL,
  `idHelmet` int(11) DEFAULT NULL,
  `idWeapon` int(11) DEFAULT NULL,
  `idShield` int(11) NOT NULL,
  `idBody` int(11) DEFAULT NULL,
  `idItemWeapon` int(11) NOT NULL,
  `idItemBody` int(11) NOT NULL,
  `idItemShield` int(11) NOT NULL,
  `idItemHelmet` int(11) NOT NULL,
  `spellsAcertados` int(11) DEFAULT '0',
  `spellsErrados` int(11) DEFAULT '0',
  `hp` int(11) DEFAULT NULL,
  `maxHp` int(11) DEFAULT NULL,
  `mana` int(11) DEFAULT NULL,
  `maxMana` int(11) DEFAULT NULL,
  `idRaza` int(11) DEFAULT NULL,
  `idGenero` int(11) DEFAULT NULL,
  `muerto` int(11) DEFAULT NULL,
  `minHit` int(11) DEFAULT NULL,
  `maxHit` int(11) DEFAULT NULL,
  `attrFuerza` int(11) NOT NULL,
  `attrAgilidad` int(11) NOT NULL,
  `attrInteligencia` int(11) NOT NULL,
  `attrConstitucion` int(11) NOT NULL,
  `privileges` tinyint(4) NOT NULL DEFAULT '1',
  `countKilled` int(11) NOT NULL DEFAULT '0',
  `countDie` int(11) NOT NULL DEFAULT '0',
  `exp` int(11) NOT NULL DEFAULT '0',
  `expNextLevel` int(11) NOT NULL DEFAULT '50',
  `level` int(11) NOT NULL DEFAULT '1',
  `ip` varchar(15) DEFAULT NULL,
  `banned` timestamp NULL DEFAULT NULL,
  `dead` int(11) NOT NULL,
  `criminal` tinyint(1) NOT NULL,
  `navegando` tinyint(1) NOT NULL,
  `npcMatados` int(11) NOT NULL,
  `ciudadanosMatados` int(11) NOT NULL,
  `criminalesMatados` int(11) NOT NULL,
  `fianza` int(11) NOT NULL,
  `connected` tinyint(1) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `inventary`
--

CREATE TABLE IF NOT EXISTS `inventary` (
  `idInventary` int(11) NOT NULL,
  `idCharacter` int(11) NOT NULL,
  `idPos` int(11) NOT NULL,
  `idItem` int(11) NOT NULL,
  `cant` int(11) NOT NULL,
  `equipped` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `maxUsers`
--

CREATE TABLE IF NOT EXISTS `maxUsers` (
  `idMaxUsers` int(11) NOT NULL,
  `maxUsers` int(11) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rankingClases`
--

CREATE TABLE IF NOT EXISTS `rankingClases` (
  `idRankingClases` int(11) NOT NULL,
  `pos` int(11) DEFAULT NULL,
  `idClase` int(11) NOT NULL,
  `idCharacter` int(11) NOT NULL,
  `countKills` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rankingGeneral`
--

CREATE TABLE IF NOT EXISTS `rankingGeneral` (
  `idRankingGeneral` int(11) NOT NULL,
  `pos` int(11) DEFAULT NULL,
  `idAccount` int(11) NOT NULL,
  `countKills` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `spells`
--

CREATE TABLE IF NOT EXISTS `spells` (
  `idPrimarySpell` int(11) NOT NULL,
  `idCharacter` int(11) NOT NULL,
  `idSpell` int(11) NOT NULL,
  `idPos` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `deleted_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `transactions`
--

CREATE TABLE IF NOT EXISTS `transactions` (
  `idTransaction` int(11) NOT NULL,
  `idAccount` int(11) NOT NULL,
  `idTypeTransaction` int(11) DEFAULT NULL,
  `text` text,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usersOnline`
--

CREATE TABLE IF NOT EXISTS `usersOnline` (
  `usersOnline` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Volcado de datos para la tabla `usersOnline`
--

INSERT INTO `usersOnline` (`usersOnline`) VALUES
(0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `vault`
--

CREATE TABLE IF NOT EXISTS `vault` (
  `idVault` int(11) NOT NULL,
  `idAccount` int(11) NOT NULL,
  `idPos` int(11) NOT NULL,
  `idItem` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `accounts`
--
ALTER TABLE `accounts`
  ADD PRIMARY KEY (`idAccount`);

--
-- Indices de la tabla `balanceRazas`
--
ALTER TABLE `balanceRazas`
  ADD PRIMARY KEY (`idBalanceRazas`);

--
-- Indices de la tabla `blacklist`
--
ALTER TABLE `blacklist`
  ADD PRIMARY KEY (`idBlackList`);

--
-- Indices de la tabla `characters`
--
ALTER TABLE `characters`
  ADD PRIMARY KEY (`idCharacter`),
  ADD KEY `fk_characters_users_idx` (`idAccount`);

--
-- Indices de la tabla `inventary`
--
ALTER TABLE `inventary`
  ADD PRIMARY KEY (`idInventary`),
  ADD KEY `fk_inventary_characters1_idx` (`idCharacter`);

--
-- Indices de la tabla `maxUsers`
--
ALTER TABLE `maxUsers`
  ADD PRIMARY KEY (`idMaxUsers`);

--
-- Indices de la tabla `rankingClases`
--
ALTER TABLE `rankingClases`
  ADD PRIMARY KEY (`idRankingClases`),
  ADD KEY `fk_rankingClases_characters1_idx` (`idCharacter`);

--
-- Indices de la tabla `rankingGeneral`
--
ALTER TABLE `rankingGeneral`
  ADD PRIMARY KEY (`idRankingGeneral`),
  ADD KEY `fk_rankingGeneral_accounts1_idx` (`idAccount`);

--
-- Indices de la tabla `spells`
--
ALTER TABLE `spells`
  ADD PRIMARY KEY (`idPrimarySpell`);

--
-- Indices de la tabla `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`idTransaction`),
  ADD KEY `fk_transactions_accounts1_idx` (`idAccount`);

--
-- Indices de la tabla `vault`
--
ALTER TABLE `vault`
  ADD PRIMARY KEY (`idVault`),
  ADD KEY `fk_vault_users1_idx` (`idAccount`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `accounts`
--
ALTER TABLE `accounts`
  MODIFY `idAccount` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT de la tabla `balanceRazas`
--
ALTER TABLE `balanceRazas`
  MODIFY `idBalanceRazas` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=6;
--
-- AUTO_INCREMENT de la tabla `blacklist`
--
ALTER TABLE `blacklist`
  MODIFY `idBlackList` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT de la tabla `characters`
--
ALTER TABLE `characters`
  MODIFY `idCharacter` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT de la tabla `inventary`
--
ALTER TABLE `inventary`
  MODIFY `idInventary` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT de la tabla `maxUsers`
--
ALTER TABLE `maxUsers`
  MODIFY `idMaxUsers` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT de la tabla `rankingClases`
--
ALTER TABLE `rankingClases`
  MODIFY `idRankingClases` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT de la tabla `rankingGeneral`
--
ALTER TABLE `rankingGeneral`
  MODIFY `idRankingGeneral` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT de la tabla `spells`
--
ALTER TABLE `spells`
  MODIFY `idPrimarySpell` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT de la tabla `transactions`
--
ALTER TABLE `transactions`
  MODIFY `idTransaction` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT de la tabla `vault`
--
ALTER TABLE `vault`
  MODIFY `idVault` int(11) NOT NULL AUTO_INCREMENT;
--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `characters`
--
ALTER TABLE `characters`
  ADD CONSTRAINT `fk_characters_users` FOREIGN KEY (`idAccount`) REFERENCES `accounts` (`idAccount`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Filtros para la tabla `inventary`
--
ALTER TABLE `inventary`
  ADD CONSTRAINT `fk_inventary_characters1` FOREIGN KEY (`idCharacter`) REFERENCES `characters` (`idCharacter`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Filtros para la tabla `rankingClases`
--
ALTER TABLE `rankingClases`
  ADD CONSTRAINT `fk_rankingClases_characters1` FOREIGN KEY (`idCharacter`) REFERENCES `characters` (`idCharacter`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Filtros para la tabla `rankingGeneral`
--
ALTER TABLE `rankingGeneral`
  ADD CONSTRAINT `fk_rankingGeneral_accounts1` FOREIGN KEY (`idAccount`) REFERENCES `accounts` (`idAccount`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Filtros para la tabla `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `fk_transactions_accounts1` FOREIGN KEY (`idAccount`) REFERENCES `accounts` (`idAccount`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Filtros para la tabla `vault`
--
ALTER TABLE `vault`
  ADD CONSTRAINT `fk_vault_users1` FOREIGN KEY (`idAccount`) REFERENCES `accounts` (`idAccount`) ON DELETE NO ACTION ON UPDATE NO ACTION;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
